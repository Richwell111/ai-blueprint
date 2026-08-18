import { NextResponse, type NextRequest } from "next/server";
import { withRenderPage } from "@/lib/puppeteer";
import type { CertificateData } from "@/types/certificate";

const EXPORT_WIDTH = 1400;
const EXPORT_HEIGHT = Math.round(EXPORT_WIDTH / 1.414);
const DEVICE_SCALE_FACTOR = 2;

export async function POST(request: NextRequest) {
  let data: CertificateData;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Navigate over loopback, not `request.nextUrl.origin`: on Render the edge
  // proxy terminates TLS but forwards to this container over plain HTTP, so
  // trusting forwarded headers there produces `https://localhost:<port>` and
  // Puppeteer's self-request fails with ERR_SSL_PROTOCOL_ERROR. Puppeteer and
  // the server share this container, so loopback + the bound port is correct
  // in both dev and prod.
  const port = process.env.PORT ?? "3000";
  const printUrl = new URL("/certificate/print", `http://127.0.0.1:${port}`);
  printUrl.searchParams.set("data", JSON.stringify(data));

  try {
    const png = await withRenderPage(async (page) => {
      await page.setViewport({
        width: EXPORT_WIDTH,
        height: EXPORT_HEIGHT,
        deviceScaleFactor: DEVICE_SCALE_FACTOR,
      });
      await page.goto(printUrl.toString(), { waitUntil: "networkidle0" });
      await page.evaluate(() => document.fonts.ready);
      const certificate = await page.waitForSelector(
        "[data-certificate-export]",
      );
      if (!certificate) {
        throw new Error("Certificate export element not found");
      }
      return certificate.screenshot({ type: "png" });
    });

    // Puppeteer's Uint8Array is backed by an ArrayBufferLike, which TS won't
    // accept directly as BodyInit; copy into a plain ArrayBuffer instead.
    const buffer = new ArrayBuffer(png.byteLength);
    new Uint8Array(buffer).set(png);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="certificate.png"',
      },
    });
  } catch (error) {
    console.error("PNG export failed", error);
    return NextResponse.json(
      { error: "Failed to render certificate PNG" },
      { status: 500 },
    );
  }
}
