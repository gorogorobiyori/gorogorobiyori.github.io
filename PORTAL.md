# ポータル（トップ・アプリのページ）の手引き

招待のページ（`<app>/join/`）とは別に、ごろごろ日和の紹介ページを置いています。
静的なファイルだけ。アクセス解析・外部スクリプトは使いません。
フォントだけは、どの端末（iPhone・Mac・Windows）でも同じ見た目にするため、Google Fonts の **LINE Seed JP**（400・700・800）を読み込みます。
読めないときは端末のフォントで表示されます。新しいページを作るときは、`<head>` の Google Fonts の3行もコピーすること（招待のページには入れない）。

## ファイル

| ファイル | 役割 |
|---|---|
| `index.html` | トップ（屋号・アプリ一覧・大事にしていること） |
| `apps.json` | アプリ一覧。トップ、各アプリの「ほかのアプリ」、アプリ内のクロスプロモーションが読む |
| `assets/site.css` / `assets/site.js` | ポータル共通の見た目と、apps.json からカードを並べる処理（招待用の invite.css / invite.js とは別） |
| `<app>/index.html` | アプリのページ（`kattoko/`・`mataiko/`・`onedari/`） |
| `<app>/screens/1〜3.jpg` | アプリのページのスクリーンショット（幅540px・JPEG） |
| `support/index.html` | 共通のサポート窓口 |
| `privacy/index.html` | このサイト自体のプライバシー |

## アプリのページを足すとき

いまあるのは `kattoko/`・`mataiko/`・`onedari/`。どれも同じ形なので、近いものをコピーして作る。

1. 既存のアプリのページ（例：`mataiko/index.html`）を `<app>/index.html` にコピーする
2. コメント「アプリごとに変えるところ（1）〜（6）」を書き換える
   - （1）配色：アプリの Asset Catalog と同じ値（ライト・ダーク）。文字とボタンのコントラストは 4.5:1 以上
   - （2）ヒーロー：名前、キャッチ、料金のひとこと、App Store の ID（`apple-itunes-app` の meta も）
   - （3）できること：スクリーンショット3枚と、見出し・説明・代替テキスト（各アプリのセッションに用意してもらう）
   - （4）料金、（5）よくある質問、（6）規約のリンク
   - 「大事にしていること」の2つ目（何に300円か）と4つ目（アプリらしさ）を変える
   - 「ほかのアプリ」の `data-exclude` を自分のスラッグに
3. `apps.json` のそのアプリに `"pageURL": "https://gorogorobiyori.github.io/<app>/"` を足す
4. `support/index.html` の「アプリごとのページ」のリンクを `/<app>/` に替える
5. `index.html` の予備の一覧（apps.json が読めないとき用）にも「くわしく見る」を足す

文言は「困りごとの解決」より「楽しく、心地よく使える」前向きな言い方にそろえる。

## apps.json の決まり

- **公開前のアプリは載せない**（審査中・開発中は外す）
- 並び順がそのまま表示順
- `id`（App Store の数字）・`slug`・`name`・`tagline` が欠けたものは表示されない
- 知らないキーは無視されるので、項目を足してもアプリ側は壊れない
- アイコンは `/<slug>/icon.png`（招待のページと同じ画像）を使う

## アプリの画面（スクリーンショット）

トップの一覧では、`apps.json` に `screenshotURL` があるアプリだけ、枠の下からiPhoneの画面が顔を出します（画面の上半分くらいが見える）。

- 置き場所：`<app>/screens/1.jpg`（1枚目が一覧に出る。2・3枚目はアプリのページ用）
- 元にする画像：App Store用に撮った6.1インチ（1179×2556）の**文字入れしていない素の画面**。ステータスバーは 9:41 のままでよい
- 一覧で見えるのは上の方だけなので、1枚目は「アプリの顔」になる画面を選ぶ
- 縮小（Macで）：`sips -Z 1171 -s format jpeg -s formatOptions 82 元画像.png --out 1.jpg`（幅540px・1枚50KB前後）
- `apps.json` に `"screenshotURL": "https://gorogorobiyori.github.io/<app>/screens/1.jpg"` を足す
- `index.html` の予備の一覧にも、おねだり！と同じ形で `has-shot` と `<div class="shot">` を足す

## 近日公開のアプリ

公開前のアプリは `apps.json` に載せない（アプリ内の宣伝にも出てしまうため）。代わりにトップの `index.html` に「近日公開」の枠を直接書く。

- 枠は `<li class="app-card ... is-soon" data-soon="<slug>">`。ボタンの代わりに `<span class="soon-badge">近日公開</span>`
- 公開したら `apps.json` にそのアプリを足すだけで、この枠は自動で消えて通常の枠に替わる（あとで `index.html` からも消しておく）
