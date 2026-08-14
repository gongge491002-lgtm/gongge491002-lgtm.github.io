/* 革命 · Revolution 主题交互脚本 */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- 1. 暗色模式 ---------- */
  var themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      root.style.colorScheme = next;
      try {
        localStorage.setItem("theme", next);
      } catch (e) { /* 忽略隐私模式 */ }
    });
  }

  /* ---------- 2. 移动端导航抽屉 ---------- */
  var menuToggle = document.getElementById("menu-toggle");
  var drawer = document.getElementById("nav-drawer");
  var scrim = document.getElementById("nav-scrim");

  function openDrawer() {
    if (!drawer || !scrim) return;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    // 下一帧再显示遮罩，保证过渡动画
    requestAnimationFrame(function () { scrim.classList.add("show"); });
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!drawer || !scrim) return;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.classList.remove("show");
    document.body.style.overflow = "";
    setTimeout(function () { scrim.hidden = true; }, 260);
  }

  if (menuToggle) menuToggle.addEventListener("click", openDrawer);
  if (scrim) scrim.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ---------- 3. 返回顶部 FAB + 顶栏滚动状态 ---------- */
  var fab = document.getElementById("fab-top");
  var appBar = document.querySelector(".top-app-bar");
  if (fab) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      fab.hidden = y < 400;
      if (appBar) appBar.classList.toggle("scrolled", y > 8);
    }, { passive: true });
    fab.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 4. 阅读进度条 ---------- */
  var progress = document.getElementById("reading-progress");
  if (progress) {
    function updateProgress() {
      var doc = document.documentElement;
      var total = doc.scrollHeight - doc.clientHeight;
      var ratio = total > 0 ? window.scrollY / total : 0;
      progress.style.width = (ratio * 100).toFixed(2) + "%";
    }
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- 5. 文章目录（TOC） ---------- */
  var tocContainer = document.getElementById("toc");
  var content = document.getElementById("post-content");
  if (tocContainer && content) {
    var headings = content.querySelectorAll("h2, h3, h4");
    if (headings.length > 1) {
      var list = document.createElement("ol");
      list.className = "toc-list";

      var title = document.createElement("p");
      title.className = "toc-title";
      title.textContent = "目录";
      tocContainer.appendChild(title);

      var items = [];
      headings.forEach(function (h, i) {
        if (!h.id) {
          h.id = "section-" + (i + 1);
        }
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + h.id;
        a.textContent = h.textContent;
        a.className = "toc-" + h.tagName.toLowerCase();
        li.appendChild(a);
        list.appendChild(li);
        items.push({ a: a, heading: h });
      });
      tocContainer.appendChild(list);

      // IntersectionObserver 高亮当前标题
      if ("IntersectionObserver" in window) {
        var activeLink = null;
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var link = items.find(function (it) { return it.heading === entry.target; });
            if (!link) return;
            if (activeLink) activeLink.a.classList.remove("active");
            link.a.classList.add("active");
            activeLink = link;
          });
        }, { rootMargin: "-80px 0px -70% 0px", threshold: 0 });
        headings.forEach(function (h) { observer.observe(h); });
      }

      // 平滑滚动到锚点（html 已有 scroll-behavior）
      list.addEventListener("click", function (e) {
        var target = e.target.closest("a");
        if (!target) return;
        var id = target.getAttribute("href").slice(1);
        var el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", "#" + id);
        }
      });
    }
  }
})();
