/*
 * 招待ページの共通処理(全アプリ共通。アプリごとの違いは各ページの INVITE_CONFIG と文面だけ)。
 *
 * ページURL:  https://gorogorobiyori.github.io/<アプリ>/join/#s=<iCloud共有ID>
 *   s=<ID>      … https://www.icloud.com/share/<ID> のIDだけ(通常はこちら)
 *   u=<base64url> … 想定外の形の共有リンクだった時の予備(リンク全体)
 * 「#」以降はWebサーバーに送られないので、招待の中身はこの端末の中だけで扱われる。
 *
 * アプリ側の対になる処理: 各アプリの InviteRelay.swift(形式を変える時は両方そろえること)。
 */
(() => {
  "use strict";

  const config = window.INVITE_CONFIG || {};
  const SHARE_ID = /^[A-Za-z0-9_-]{1,128}$/;
  const BASE64URL = /^[A-Za-z0-9_-]+$/;

  function decodeBase64URL(value) {
    try {
      let base64 = value.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) base64 += "=";
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return null;
    }
  }

  function isICloudShareURL(value) {
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      return url.protocol === "https:"
        && (host === "icloud.com" || host.endsWith(".icloud.com"))
        && url.pathname.startsWith("/share");
    } catch {
      return false;
    }
  }

  /** ページURLの「#」以降から招待を読み取る。正しくなければnull。 */
  function readInvite() {
    const params = new URLSearchParams(location.hash.slice(1));
    const id = params.get("s");
    if (id !== null) {
      return SHARE_ID.test(id)
        ? { payload: "s=" + id, shareURL: "https://www.icloud.com/share/" + id }
        : null;
    }
    const encoded = params.get("u");
    if (encoded !== null && BASE64URL.test(encoded)) {
      const raw = decodeBase64URL(encoded);
      return raw && isICloudShareURL(raw) ? { payload: "u=" + encoded, shareURL: raw } : null;
    }
    return null;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // LINEのアプリ内ブラウザなどで使えない場合の予備
    }
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      area.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }

  const $ = (selector) => document.querySelector(selector);
  const status = $("#status");
  const setStatus = (text) => { if (status) status.textContent = text; };

  const invite = readInvite();
  if (!invite) {
    $("#invalid").hidden = false;
    return;
  }
  $("#invite").hidden = false;

  const shareURLText = $("#share-url");
  if (shareURLText) shareURLText.textContent = invite.shareURL;

  // アプリを持っている人: アプリ専用URLで開く。開かなければ(未インストール・古い版)案内を出す。
  const openButton = $('[data-action="open"]');
  openButton.href = config.scheme + "://join?" + invite.payload;
  openButton.addEventListener("click", () => {
    const timer = setTimeout(() => {
      if (document.visibilityState === "visible") $("#not-opened").hidden = false;
    }, 2500);
    document.addEventListener("visibilitychange", () => clearTimeout(timer), { once: true });
  });

  // まだ持っていない人: 招待リンクをコピーしてからApp Storeへ。
  // インストール後の初回起動で、アプリが「招待を受け取りましたか？」と聞いて貼り付けてもらう。
  $('[data-action="install"]').addEventListener("click", async (event) => {
    event.preventDefault();
    const ok = await copyText(invite.shareURL);
    if (ok) {
      setStatus("招待リンクをコピーしました。App Storeを開きます…");
      setTimeout(() => { location.href = config.appStoreURL; }, 700);
    } else {
      setStatus("招待リンクを自動でコピーできませんでした。下の「うまくいかないとき」からコピーしてから、App Storeでインストールしてください。");
      $("#fallback").open = true;
    }
  });

  $('[data-action="copy"]').addEventListener("click", async () => {
    const ok = await copyText(invite.shareURL);
    setStatus(ok ? "招待リンクをコピーしました。" : "コピーできませんでした。リンクを長押しして選択してください。");
  });
})();
