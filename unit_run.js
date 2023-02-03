const fs = require('fs');
const assert = require('assert');
const puppeteer = require('puppeteer');
const { basename } = require('path');
const { exit } = require('process');
(async() => {
  const url = process.argv[2];
  if (!url) {
    console.log('node unit_run.js http://localhost:2525/ZIZAIS01_G001/ZIZAIS01_G001.html のようにURLを指定してください')
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

  console.log('PDF変換を開始します')
  const dateStr = new Date()
            .toISOString()
            .replace(/[^0-9]/g, '')
            .slice(0, -5);
  const dirpath = 'out/' + dateStr;
  fs.mkdirSync(dirpath, { recursive: true });
  await page.goto(url, {
    waitUntil: "networkidle0"
  });
  await page.addStyleTag({content: ' kbd{background: white; box-shadow: none; border-radius: 0px; border: 1px solid #999;} @page{size:auto !important}'})
  const width = await page.evaluate(() => document.documentElement.offsetWidth);
  const height = await page.evaluate(() => document.documentElement.offsetHeight);
  // PDF作成処理
  await page.pdf({
      path: dirpath + '/' + basename(url).split('.')[0] + '.pdf',
      printBackground: true,
      margin: { top: '37px', right: '37px', bottom: '37px', left: '37px' },
      width: 793,
      height: height + 700,
  });
  process.stdout.write(`\rPDF変換中…`)
  process.stdout.write("\n");
  console.log('PDF変換が完了しました')
  browser.close();
})();
