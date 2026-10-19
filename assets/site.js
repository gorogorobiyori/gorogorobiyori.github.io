/*
  ごろごろ日和 サイト共通の処理（自前のみ。外部スクリプトは読み込まない）

  apps.json を読み、data-apps を付けた要素にアプリのカードを並べる。
    <ul class="app-grid" data-apps></ul>                  … すべてのアプリ
    <ul class="app-grid" data-apps data-exclude="onedari"></ul> … 指定したアプリを除く（「ほかのアプリ」）
  読み込みに失敗したら、要素の中にもともと書いてある内容（予備の一覧）をそのまま残す。
*/
(function () {
  "use strict";

  var targets = document.querySelectorAll("[data-apps]");
  if (!targets.length || !window.fetch) return;

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function isSafeColor(v) { return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v); }
  function isSafeSlug(v) { return typeof v === "string" && /^[a-z0-9-]+$/.test(v); }
  function isSafeID(v) { return typeof v === "string" && /^[0-9]+$/.test(v); }

  // スクリーンショットは、このサイトの /<slug>/screens/ の画像だけ使う（プレビュー環境でも出るようにパスだけ取り出す）
  function screenshotPath(app) {
    var prefix = "https://gorogorobiyori.github.io/" + app.slug + "/screens/";
    var v = app.screenshotURL;
    if (typeof v !== "string" || v.indexOf(prefix) !== 0 || !/\.(jpg|png|webp)$/.test(v)) return null;
    return v.slice("https://gorogorobiyori.github.io".length);
  }

  function card(app) {
    var storeURL = "https://apps.apple.com/jp/app/id" + app.id;
    var hasPage = typeof app.pageURL === "string" && app.pageURL.indexOf("https://gorogorobiyori.github.io/") === 0;
    var links = [el("a", { href: storeURL, "class": "store", text: "App Storeで見る" })];
    if (hasPage) links.push(el("a", { href: app.pageURL, text: "くわしく見る" }));

    var li = el("li", { "class": "app-card" }, [
      el("img", { src: "/" + app.slug + "/icon.png", alt: "", width: "64", height: "64" }),
      el("div", {}, [
        hasPage ? el("h3", {}, [el("a", { href: app.pageURL, text: app.name })]) : el("h3", { text: app.name }),
        el("p", { text: app.tagline }),
        el("div", { "class": "links" }, links)
      ])
    ]);
    var shot = screenshotPath(app);
    if (shot) {
      li.classList.add("has-shot");
      li.appendChild(el("div", { "class": "shot", "aria-hidden": "true" }, [
        el("img", { src: shot, alt: "", width: "540", height: "1171", loading: "lazy" })
      ]));
    }
    if (isSafeColor(app.accent)) li.style.setProperty("--card-accent", app.accent);
    return li;
  }

  fetch("/apps.json", { cache: "no-cache" })
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (data) {
      // 必須の項目が欠けているもの・形がおかしいものは、その項目だけ捨てる（アプリ側の読み込み方針と同じ）
      var apps = (data && Array.isArray(data.apps) ? data.apps : []).filter(function (a) {
        return a && isSafeID(a.id) && isSafeSlug(a.slug) && typeof a.name === "string" && typeof a.tagline === "string";
      });
      targets.forEach(function (target) {
        var exclude = target.getAttribute("data-exclude");
        var list = apps.filter(function (a) { return a.slug !== exclude; });
        if (!list.length) { // 自分しかいなければ欄ごと隠す
          var section = target.closest("section");
          if (section && exclude) section.hidden = true;
          return;
        }
        target.textContent = "";
        list.forEach(function (a) { target.appendChild(card(a)); });
      });
    })
    .catch(function () { /* 予備の一覧をそのまま見せる */ });
})();
