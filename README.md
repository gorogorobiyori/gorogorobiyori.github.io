# gorogorobiyori.github.io

「ごろごろ日和」(個人開発のアプリの屋号)の公開サイト(GitHub Pages、`https://gorogorobiyori.github.io/`)。
サーバーは持たない。静的ファイルのみ。アクセス解析・外部フォント・外部スクリプトは読み込まない。

## 構成

```
assets/invite.js     招待ページの共通処理(全アプリ共通)
assets/invite.css    招待ページの共通スタイル(色は各ページで上書き)
<アプリ>/join/       アプリごとの招待ページ(文面・色・URLスキーム・App StoreのURLだけ違う)
<アプリ>/icon.png    招待ページとLINEのプレビューに出すアイコン(192px、角丸なし)
.nojekyll            Jekyllの加工を止める
```

現在のアプリ: `kattoko`(カットコ！)

## 招待ページの仕組み

1. アプリが iCloud の共有リンク `https://www.icloud.com/share/<ID>` を
   `https://gorogorobiyori.github.io/<アプリ>/join/#s=<ID>` に包んで送る
2. 受け取った人がページを開く
   - 「〇〇で参加する」→ `<スキーム>://join?s=<ID>` でアプリが開いて参加
   - 「インストールする」→ 共有リンクをコピーしてから App Store へ。インストール後の初回起動で、アプリが「招待を受け取りましたか？」と聞き、［ペースト］で参加
3. `#` 以降はWebサーバーに送られないので、招待の中身はGitHub側にも届かない

アプリ側の対になる処理は各アプリの `InviteRelay.swift`。**形式(`s=` / `u=`、`join` のパス)を変える時は両方そろえる**。
設計の全体は Kattoko リポジトリの `docs/invite-relay-design.md`。

## 新しいアプリの招待ページを足す手順

1. `kattoko/` をコピーして `<アプリ>/` を作る
2. `<アプリ>/join/index.html` の次を書き換える
   - タイトル・OGP・文面(アプリ名、何に招待されているか、手動で参加する時の画面の場所)
   - `:root` の色(ライト/ダーク)
   - `INVITE_CONFIG` の `scheme`(アプリの Info.plist の `CFBundleURLSchemes` と同じ)と `appStoreURL`
3. `<アプリ>/icon.png` を差し替える(`sips -s format png -z 192 192 AppIcon-1024.png --out icon.png`)
4. push して、`https://gorogorobiyori.github.io/<アプリ>/join/#s=test` で表示を確認する
