# ページのリンク先URLのコンテンツを一括でPDFに変換するくん

## 概要

- ページのリンク先URLのコンテンツを、一括でPDFに変換します
- Node.jsの16以上が必要です

## 使い方

```
# プログラムを持ってくる
$ git clone git@github.com:labeneko/convertUrl2Pdf.git

$ cd convertUrl2Pdf

$ npm install
```
### 単体実行

```
$ node unit_run.js http://localhost:2525/ZIZAIS01_G001/ZIZAIS01_G001.html
```


### 複数件実行 (教材へのリンクタグが必要です)

```
$ node run.js http://localhost:2525
```

- outディレクトリの下にpdf一覧が格納されます