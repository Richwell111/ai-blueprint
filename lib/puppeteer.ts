import puppeteer, { type Browser, type Page } from "puppeteer";

const LAUNCH_ARGS = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
];

// Render's containers are small; cap concurrent Puppeteer renders and
// queue the rest instead of exhausting memory under a burst of requests.
const MAX_CONCURRENT_RENDERS = 2;

let browserPromise: Promise<Browser> | null = null;

function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({ headless: true, args: LAUNCH_ARGS });
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchBrowser();
  }
  const browser = await browserPromise;
  if (!browser.connected) {
    browserPromise = launchBrowser();
    return browserPromise;
  }
  return browser;
}

let activeRenders = 0;
const renderQueue: (() => void)[] = [];

async function acquireRenderSlot(): Promise<void> {
  if (activeRenders < MAX_CONCURRENT_RENDERS) {
    activeRenders++;
    return;
  }
  await new Promise<void>((resolve) => renderQueue.push(resolve));
  activeRenders++;
}

function releaseRenderSlot(): void {
  activeRenders--;
  renderQueue.shift()?.();
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
