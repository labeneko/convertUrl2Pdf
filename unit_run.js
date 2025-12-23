const os = require('os');
const path = require('path');
const fs = require('fs');

// Chrome / Chromium の実行パスを動的に取得する関数
function getChromeExecutablePath() {
  const platform = os.platform(); // 'darwin', 'linux', 'win32'
  const arch = os.arch(); // 'x64', 'arm64' など

  if (platform === 'darwin') {
    if (arch === 'arm64') {
      // Apple Silicon Mac (M1/M2)
      const chromiumArmPath = '/Applications/Chromium.app/Contents/MacOS/Chromium';
      if (fs.existsSync(chromiumArmPath)) return chromiumArmPath;

      const chromeArmPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      if (fs.existsSync(chromeArmPath)) return chromeArmPath;
    } else {
      // Intel Mac
      const chromeIntelPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      if (fs.existsSync(chromeIntelPath)) return chromeIntelPath;
    }
  } else if (platform === 'linux') {
    const chromeLinuxPath = '/usr/bin/google-chrome';
    if (fs.existsSync(chromeLinuxPath)) return chromeLinuxPath;
  } else if (platform === 'win32') {
    const chromeWinPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (fs.existsSync(chromeWinPath)) return chromeWinPath;

    const chromeWinPathX86 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    if (fs.existsSync(chromeWinPathX86)) return chromeWinPathX86;
  }

  console.warn('⚠️ 適切な Chrome/Chromium のパスが見つかりません。 Puppeteer デフォルトを使用します。');
  return null;
}


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
        executablePath: executablePath || undefined, // パスが見つからなければ puppeteer がデフォルトで探す
  defaultViewport:  {
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
  await page.waitForFunction(() => {
    console.log(window.location.href)
    return window.document.readyState === 'interactive' || window.document.readyState === 'complete'
  });
  await page.addStyleTag({content: ' kbd:has(img) {background: white; box-shadow: none; border-radius: 0px; border: 1px solid #999;} @page{size:auto !important}'})
  const width = await page.evaluate(() => document.body.scrollWidth);
  let height = await page.evaluate(() => document.body.scrollHeight);
  console.log(height);
  // PDF作成処理
  await page.pdf({
      path: dirpath + '/' + basename(url).split('.')[0] + '.pdf',
      printBackground: true,
      margin: { top: '37px', right: '37px', bottom: '37px', left: '37px' },
      width: 793,
      height: height + 2000,
      printBackground: true,
  });
  process.stdout.write(`\rPDF変換中…`)
  process.stdout.write("\n");
  console.log('PDF変換が完了しました')
  browser.close();
})();
