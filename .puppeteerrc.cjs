// eslint-disable-next-line @typescript-eslint/no-require-imports -- Puppeteer loads this config via CommonJS require, not ESM.
const { join } = require("node:path");

/** @type {import("puppeteer").Configuration} */
module.exports = {
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
