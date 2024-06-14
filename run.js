const fs = require('fs');
const assert = require('assert');
const puppeteer = require('puppeteer');
const { basename } = require('path');
const { exit } = require('process');
(async() => {
  const baseUrl = process.argv[2];
  if (!baseUrl) {
    console.log('node run.js http://localhost:2525 のようにURLを指定してください')
    exit(1);
  }
  let args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--window-size=800,450'
  ];
  const browser = await puppeteer.launch({
        headless: true,
        args: args,
        defaultViewport: {
            width: 800,
            height: 450
          }
  });
  const page = await browser.newPage();

  // PDF出力対象ページ
  await page.goto(baseUrl);
  const urls = await page.evaluate((baseUrl) => {
    const list = Array.from(document.querySelectorAll('a')).filter(data => data.getAttribute('href'));
    return list.map(data => {
      return new URL(data.getAttribute('href'), baseUrl).toString()
    });
  }, baseUrl);

  console.log('PDF変換を開始します')
  const dateStr = new Date()
            .toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, -5);
  const dirpath = 'out/' + dateStr;
  fs.mkdirSync(dirpath, { recursive: true });
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    await page.goto(url, {
      waitUntil: "networkidle0"
    });
    await page.addStyleTag({content: ' kbd:has(img) {background: white; box-shadow: none; border-radius: 0px; border: 1px solid #999;} @page{size:auto !important}'})
    const width = await page.evaluate(() => document.body.scrollWidth);
    const height = await page.evaluate(() => document.body.scrollHeight);
    // PDF作成処理
    await page.pdf({
        path: dirpath + '/' + basename(url).split('.')[0] + '.pdf',
        printBackground: true,
        margin: { top: '37px', right: '37px', bottom: '37px', left: '37px' },
        width: 793,
        height: height + 2000,
        printBackground: true,
    });
    process.stdout.write(`\r[${i+1}/${urls.length}] PDF変換中…`)
  };
  process.stdout.write("\n");
  console.log('PDF変換が完了しました')
  browser.close();
})();
