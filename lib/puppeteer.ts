import puppeteer, { type Browser, type Page } from "puppeteer";

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
];

// Render's containers are small; cap concurrent Puppeteer renders and
// queue the rest instead of exhausting memory under a burst of requests.
const MAX_CONCURRENT_RENDERS = 2;
const MAX_QUEUED_RENDERS = 4;
const RENDER_QUEUE_TIMEOUT_MS = 30_000;

export class RenderCapacityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RenderCapacityError";
  }
}

let browserPromise: Promise<Browser> | null = null;

function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({ headless: true, args: LAUNCH_ARGS });
}

function startBrowser(): Promise<Browser> {
  const pendingBrowser = launchBrowser();
  browserPromise = pendingBrowser;
  pendingBrowser.catch(() => {
    if (browserPromise === pendingBrowser) {
      browserPromise = null;
    }
  });
  return pendingBrowser;
}

async function getBrowser(): Promise<Browser> {
  const pendingBrowser = browserPromise ?? startBrowser();
  const browser = await pendingBrowser;
  if (!browser.connected) {
    return startBrowser();
  }
  return browser;
}

let activeRenders = 0;
interface RenderQueueEntry {
  resolve: () => void;
  reject: (error: RenderCapacityError) => void;
  timeout: ReturnType<typeof setTimeout>;
}

const renderQueue: RenderQueueEntry[] = [];

async function acquireRenderSlot(): Promise<void> {
  if (activeRenders < MAX_CONCURRENT_RENDERS) {
    activeRenders++;
    return;
  }
  if (renderQueue.length >= MAX_QUEUED_RENDERS) {
    throw new RenderCapacityError("Certificate renderer is at capacity");
  }
  await new Promise<void>((resolve, reject) => {
    const entry: RenderQueueEntry = {
      resolve,
      reject,
      timeout: setTimeout(() => {
        const index = renderQueue.indexOf(entry);
        if (index !== -1) {
          renderQueue.splice(index, 1);
        }
        reject(new RenderCapacityError("Timed out waiting to render"));
      }, RENDER_QUEUE_TIMEOUT_MS),
    };
    renderQueue.push(entry);
  });
  activeRenders++;
}

function releaseRenderSlot(): void {
  activeRenders--;
  const nextRender = renderQueue.shift();
  if (nextRender) {
    clearTimeout(nextRender.timeout);
    nextRender.resolve();
  }
}

/** Runs `run` with a fresh page from the shared browser, queued behind the concurrency cap. */
export async function withRenderPage<T>(
  run: (page: Page) => Promise<T>,
): Promise<T> {
  await acquireRenderSlot();
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
      return await run(page);
    } finally {
      await page.close();
    }
  } finally {
    releaseRenderSlot();
  }
}
