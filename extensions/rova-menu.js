// Rova Menu Extension
// Fully customizable scrollable menu with search

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Rova Menu requires unsandboxed mode.");
  }

  const { BlockType, ArgumentType, Cast } = Scratch;

  // ── State ────────────────────────────────────────────────────────────────────
  let menus = {}; // id -> { el, items, clickedValue, clickedIndex, searchValue }

  // ── Inject base styles ───────────────────────────────────────────────────────
  function injectBaseStyles() {
    // Versioned ID so old cached style tags from earlier extension versions
    // are replaced when new CSS rules (e.g. the like badge) are added.
    const STYLE_ID = 'rova-menu-styles-v2';
    // Remove any older versions so we always have the latest rules
    const old = document.getElementById('rova-menu-styles');
    if (old) old.remove();
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .rova-menu {
        position: absolute;
        display: flex;
        flex-direction: column;
        background: #2b2b2b;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        pointer-events: auto;
        user-select: none;
        z-index: 999;
      }

      /* ── Tab bar ── */
      .rova-menu-tabs {
        display: flex;
        flex-direction: column;
        padding: 12px 12px 0;
        gap: 8px;
        flex-shrink: 0;
      }
      .rova-menu-tab-buttons {
        display: flex;
        gap: 0;
      }
      .rova-menu-tab-btn {
        flex: 1;
        background: none;
        border: none;
        color: rgba(255,255,255,0.5);
        font-size: 18px;
        padding: 12px 0;
        min-height: 44px;
        cursor: pointer;
        transition: color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        position: relative;
        z-index: 10;
        -webkit-user-select: none;
        user-select: none;
      }
      .rova-menu-tab-btn.active {
        color: white;
      }
      .rova-menu-tab-indicators {
        display: flex;
        gap: 6px;
      }
      .rova-menu-tab-indicator {
        flex: 1;
        height: 2px;
        border-radius: 1px;
        background: #444;
        transition: background 0.2s;
      }
      .rova-menu-tab-indicator.active {
        background: white;
      }

      /* ── Subtabs ── */
      .rova-menu-subtabs {
        display: flex;
        gap: 6px;
        padding: 6px 12px 4px;
        flex-shrink: 0;
      }
      .rova-menu-subtab-btn {
        flex: 0 0 auto;
        background: none;
        border: none;
        color: rgba(255,255,255,0.55);
        font-size: 13px;
        font-family: inherit;
        padding: 5px 14px;
        border-radius: 20px;
        cursor: pointer;
        transition: background 0.15s, color 0.15s;
        pointer-events: auto;
        -webkit-user-select: none;
        user-select: none;
        white-space: nowrap;
      }
      .rova-menu-subtab-btn:hover {
        background: rgba(255,255,255,0.08);
        color: white;
      }
      .rova-menu-subtab-btn.active {
        background: white;
        color: #1a1a1a;
        font-weight: 600;
      }

      /* ── Search bar ── */
      .rova-menu-search-wrap {
        padding: 10px 12px;
        flex-shrink: 0;
      }
      .rova-menu-search {
        width: 100%;
        background: #3a3a3a;
        border: none;
        border-radius: 20px;
        padding: 8px 14px;
        color: white;
        font-size: 13px;
        outline: none;
        box-sizing: border-box;
        font-family: inherit;
      }
      .rova-menu-search::placeholder {
        color: rgba(255,255,255,0.35);
      }

      /* ── Scroll list ── */
      .rova-menu-list {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 4px 0;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.15) transparent;
      }
      .rova-menu-list::-webkit-scrollbar {
        width: 4px;
      }
      .rova-menu-list::-webkit-scrollbar-track {
        background: transparent;
      }
      .rova-menu-list::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.15);
        border-radius: 2px;
      }

      /* ── Items ── */
      .rova-menu-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 14px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .rova-menu-item:hover {
        background: rgba(255,255,255,0.06);
      }
      .rova-menu-item:active {
        background: rgba(255,255,255,0.1);
      }
      .rova-menu-item-img {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: #444;
        object-fit: cover;
        flex-shrink: 0;
      }
      .rova-menu-item-img-placeholder {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        background: #555;
        flex-shrink: 0;
      }
      .rova-menu-item-img-wrap {
        position: relative;
        display: inline-flex;
        flex-shrink: 0;
      }
      .rova-menu-item-like {
        position: absolute;
        right: -4px;
        bottom: -4px;
        width: 20px;
        height: 20px;
        pointer-events: none;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.55));
        z-index: 2;
      }
      .rova-menu-item-like svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .rova-menu-item-text {
        flex: 1;
        min-width: 0;
      }
      .rova-menu-item-title {
        color: white;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .rova-menu-item-subtitle {
        color: rgba(255,255,255,0.45);
        font-size: 11px;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      /* ── Marquee scrolling text ── */
      .rova-marquee-clip {
        overflow: hidden;
        width: 100%;
        white-space: nowrap;
      }
      .rova-marquee-track {
        display: inline-flex;
        white-space: nowrap;
        will-change: transform;
      }
      .rova-marquee-track.scrolling {
        animation: rova-marquee var(--marquee-dur, 8s) linear infinite;
      }
      .rova-menu-item:hover .rova-marquee-track.scrolling {
        animation-play-state: paused;
      }
      .rova-marquee-part {
        display: inline-block;
        white-space: nowrap;
        padding-right: 40px;
      }
      @keyframes rova-marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }

      /* ── Now playing indicator ── */
      .rova-menu-item.now-playing {
        background: rgba(255,255,255,0.04);
      }
      .rova-menu-item-title.now-playing {
        color: white;
      }
      .rova-now-playing-bars {
        display: inline-flex;
        align-items: flex-end;
        gap: 2px;
        height: 14px;
        flex-shrink: 0;
      }
      .rova-now-playing-bars span {
        width: 3px;
        border-radius: 1.5px;
        display: block;
        min-height: 3px;
      }
      .rova-now-playing-bars span:nth-child(1) { animation: rova-bar1 0.9s ease-in-out infinite; }
      .rova-now-playing-bars span:nth-child(2) { animation: rova-bar2 0.9s ease-in-out infinite 0.2s; }
      .rova-now-playing-bars span:nth-child(3) { animation: rova-bar3 0.9s ease-in-out infinite 0.1s; }
      .rova-now-playing-bars.paused span { animation-play-state: paused; }
      @keyframes rova-bar1 { 0%,100%{height:3px} 50%{height:12px} }
      @keyframes rova-bar2 { 0%,100%{height:8px} 50%{height:3px}  }
      @keyframes rova-bar3 { 0%,100%{height:5px} 50%{height:11px} }

      /* ── Skeleton loader ── */
      @keyframes rova-skeleton-shimmer {
        0%   { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      .rova-menu-item.skeleton {
        pointer-events: none;
        cursor: default;
      }
      .rova-menu-item.skeleton:hover {
        background: none;
      }
      .rova-skeleton-block {
        border-radius: 4px;
        background: linear-gradient(90deg, #3a3a3a 25%, #4a4a4a 50%, #3a3a3a 75%);
        background-size: 800px 100%;
        animation: rova-skeleton-shimmer 1.4s infinite linear;
      }
      .rova-skeleton-img {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        flex-shrink: 0;
      }
      .rova-skeleton-title {
        height: 12px;
        width: 70%;
        margin-bottom: 6px;
      }
      .rova-skeleton-sub {
        height: 10px;
        width: 45%;
      }

      /* ── Loading overlay ── */
      .rova-menu-loading {
        display: none;
        position: absolute;
        inset: 0;
        background: rgba(20,20,20,0.85);

        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 12px;
        z-index: 20;
        border-radius: inherit;
      }
      .rova-menu-loading.visible {
        display: flex;
      }
      .rova-menu-spinner {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid rgba(255,255,255,0.15);
        border-top-color: white;
        animation: rova-menu-spin 0.7s linear infinite;
      }
      .rova-menu-loading-text {
        color: rgba(255,255,255,0.6);
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      @keyframes rova-menu-spin {
        to { transform: rotate(360deg); }
      }

      .rova-menu-item-right {
        color: rgba(255,255,255,0.35);
        font-size: 11px;
        flex-shrink: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Build menu DOM ────────────────────────────────────────────────────────────
  function buildMenu(id, opts) {
    const existing = menus[id];
    if (existing) { existing.el.remove(); }

    injectBaseStyles();

    const el = document.createElement('div');
    el.className = 'rova-menu';
    el.style.width  = (opts.width  || 280) + 'px';
    el.style.height = (opts.height || 360) + 'px';
    if (opts.css) el.style.cssText += ';' + opts.css;

    // ── Tabs ────────────────────────────────────────────────────────────────
    const tabsWrap = document.createElement('div');
    tabsWrap.className = 'rova-menu-tabs';

    const tabBtns = document.createElement('div');
    tabBtns.className = 'rova-menu-tab-buttons';

    const tabInds = document.createElement('div');
    tabInds.className = 'rova-menu-tab-indicators';

    const tabs = opts.tabs || [{ icon: '♪', label: 'tab1' }];
    const activeTab = { index: 0 };

    tabs.forEach((tab, i) => {
      const btn = document.createElement('button');
      btn.className = 'rova-menu-tab-btn' + (i === 0 ? ' active' : '');
      btn.innerHTML = tab.icon || '♪';
      if (tab.btnCSS) btn.style.cssText = tab.btnCSS;
      tabBtns.appendChild(btn);

      const ind = document.createElement('div');
      ind.className = 'rova-menu-tab-indicator' + (i === 0 ? ' active' : '');
      tabInds.appendChild(ind);

      // Use mousedown instead of click for more reliable response
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        tabBtns.querySelectorAll('.rova-menu-tab-btn').forEach((b, j) => {
          b.classList.toggle('active', j === i);
        });
        tabInds.querySelectorAll('.rova-menu-tab-indicator').forEach((ind2, j) => {
          ind2.classList.toggle('active', j === i);
        });
        activeTab.index = i;
        if (menus[id]) {
          menus[id].activeTab = i;
          refreshSubtabs(id);
        }
        renderList(id);
      });
    });

    tabsWrap.appendChild(tabBtns);
    tabsWrap.appendChild(tabInds);
    el.appendChild(tabsWrap);

    // ── Search ───────────────────────────────────────────────────────────────
    if (opts.showSearch !== false) {
      const searchWrap = document.createElement('div');
      searchWrap.className = 'rova-menu-search-wrap';
      const searchEl = document.createElement('input');
      searchEl.className = 'rova-menu-search';
      searchEl.placeholder = opts.searchPlaceholder || 'Search...';
      if (opts.searchCSS) searchEl.style.cssText = opts.searchCSS;
      searchEl.addEventListener('input', (e) => {
        e.stopPropagation();
        if (menus[id]) {
          menus[id].searchValue = searchEl.value;
          menus[id]._searchChangedQueue++;
          menus[id]._boolSearchChangedQueue++;
          Scratch.vm.runtime.startHats('rovamenu_whenSearchChanged');
        }
      });
      searchEl.addEventListener('keydown', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.key === 'Enter') e.preventDefault();
      });
      searchEl.addEventListener('keyup', (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          if (menus[id]) {
            menus[id]._searchEnteredQueue++;
            menus[id]._boolSearchEnteredQueue++;
            Scratch.vm.runtime.startHats('rovamenu_whenSearchEntered');
          }
        }
      });
      searchEl.addEventListener('keypress', (e) => { e.stopPropagation(); e.stopImmediatePropagation(); });
      searchEl.style.pointerEvents = 'auto';
      searchEl.setAttribute('tabindex', '0');
      searchWrap.appendChild(searchEl);
      el.appendChild(searchWrap);
    }

    // ── Subtabs (hidden by default, shown via block) ─────────────────────────
    const subtabsWrap = document.createElement('div');
    subtabsWrap.className = 'rova-menu-subtabs';
    subtabsWrap.style.display = 'none';
    el.appendChild(subtabsWrap);

    // ── List ─────────────────────────────────────────────────────────────────
    const listEl = document.createElement('div');
    listEl.className = 'rova-menu-list';
    if (opts.listCSS) listEl.style.cssText = opts.listCSS;
    el.appendChild(listEl);

    // Loading overlay — sits on top of list
    const loadingEl = document.createElement('div');
    loadingEl.className = 'rova-menu-loading';
    loadingEl.innerHTML = '<div class="rova-menu-spinner"></div><div class="rova-menu-loading-text">Loading...</div>';
    el.appendChild(loadingEl);

    // Attach to stage overlay. We prefer to share LordCat's overlay so all
    // UI elements live on the same layer (matching z-order, easier styling).
    // PATCH_MARKER_V4: reuse LordCat's overlay, but force its height if it
    // collapsed to 0 in the packager (its known bug).
    let overlay = document.querySelector('.LordCatInterfaces');
    if (overlay) {
      // Fix the LordCat-height-collapses-in-packager bug — make sure the
      // overlay always has a usable height so children can be positioned.
      const fixHeight = () => {
        if (!overlay) return;
        const r = overlay.getBoundingClientRect();
        if (r.height < 10) {
          const canvas = (Scratch.vm && Scratch.vm.runtime && Scratch.vm.runtime.renderer && Scratch.vm.runtime.renderer.canvas) ||
                         document.querySelector('canvas.stage') ||
                         document.querySelector('canvas[class*="stage"]') ||
                         document.querySelector('canvas');
          if (canvas) {
            const cr = canvas.getBoundingClientRect();
            overlay.style.height = cr.height + 'px';
            overlay.style.minHeight = cr.height + 'px';
          } else {
            overlay.style.height = '100%';
            overlay.style.minHeight = '100%';
          }
        }
      };
      fixHeight();
      window.addEventListener('resize', fixHeight);
      setInterval(fixHeight, 500);
    } else {
      // LordCat not loaded — create our own overlay
      overlay = document.getElementById('rova-menu-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'rova-menu-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
        console.log('[rovamenu] PATCH_MARKER_V4 — own overlay (LordCat not found)');
        try {
          if (Scratch.vm && Scratch.vm.renderer && typeof Scratch.vm.renderer.addOverlay === 'function') {
            Scratch.vm.renderer.addOverlay(overlay, 'scale');
          } else {
            throw new Error('addOverlay unavailable');
          }
        } catch(e) {
          // Packager fallback: anchor to the stage canvas and re-sync on layout changes
          const canvas = (Scratch.vm && Scratch.vm.runtime && Scratch.vm.runtime.renderer && Scratch.vm.runtime.renderer.canvas) ||
                         document.querySelector('canvas.stage') ||
                         document.querySelector('canvas[class*="stage"]') ||
                         document.querySelector('canvas');
          const host = (canvas && canvas.parentElement) || document.body;
          if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
          host.appendChild(overlay);
          const sync = () => {
            if (!canvas) return;
            const cr = canvas.getBoundingClientRect();
            const hr = host.getBoundingClientRect();
            overlay.style.left   = (cr.left - hr.left) + 'px';
            overlay.style.top    = (cr.top  - hr.top ) + 'px';
            overlay.style.width  = cr.width  + 'px';
            overlay.style.height = cr.height + 'px';
          };
          sync();
          window.addEventListener('resize', sync);
          setInterval(sync, 500);
        }
      }
    }
    overlay.appendChild(el);

    menus[id] = {
      el, listEl, loadingEl, subtabsWrap, activeTab: 0,
      items: {},      // tabIndex -> array of item objects
      clickedValue: null,
      clickedIndex: null,
      _clickQueue: 0,
      _searchChangedQueue: 0,
      _searchEnteredQueue: 0,
      _boolClickQueue: 0,
      _boolSearchChangedQueue: 0,
      _boolSearchEnteredQueue: 0,
      nowPlaying: {},   // tabIndex -> { index, color, paused }
      subtabConfig: {}, // tabIndex -> [label, label, ...]
      activeSubtab: {}, // tabIndex -> subtabIndex
      subtabChanged: {}, // tabIndex -> bool
      searchValue: '',
      likes: new Set(),   // set of item values (IDs) that are "liked"
      likeCSS: '',        // optional extra CSS applied to each heart badge
      likeIcon: null,     // optional data-URI or URL for a custom like icon
      x: 0, y: 0
    };

    return menus[id];
  }

  function renderList(id) {
    const m = menus[id];
    if (!m) return;
    const subtab = m.activeSubtab[m.activeTab] ?? 0;
    const key    = m.activeTab + ':' + subtab;
    // Fall back to tab-only key for backward compat
    const items  = m.items[key] || m.items[m.activeTab] || [];
    m.listEl.innerHTML = '';
    items.forEach((item, idx) => {
      const row = document.createElement('div');

      // Skeleton item
      if (item._skeleton) {
        row.className = 'rova-menu-item skeleton';
        row.innerHTML = '<div class="rova-skeleton-block rova-skeleton-img"></div><div style="flex:1;min-width:0"><div class="rova-skeleton-block rova-skeleton-title"></div><div class="rova-skeleton-block rova-skeleton-sub"></div></div>';
        m.listEl.appendChild(row);
        return;
      }

      row.className = 'rova-menu-item';
      if (item.css) row.style.cssText = item.css;

      // Image or placeholder — only show if image is set or showPlaceholder explicitly true
      const isLiked = item.value !== undefined && m.likes.has(String(item.value));
      let imgHost = null;
      if (item.image) {
        const img = document.createElement('img');
        img.className = 'rova-menu-item-img';
        img.src = item.image;
        img.alt = '';
        if (item.imageCSS) img.style.cssText = item.imageCSS;
        imgHost = img;
      } else if (item.showPlaceholder === true) {
        const ph = document.createElement('div');
        ph.className = 'rova-menu-item-img-placeholder';
        if (item.placeholderCSS) ph.style.cssText = item.placeholderCSS;
        imgHost = ph;
      }
      if (imgHost) {
        if (isLiked) {
          // Wrap so we can absolutely-position the heart relative to the image.
          // Don't force a size on the wrapper or image — let the page's CSS
          // (e.g. project's inject-CSS overrides) decide. We only need
          // position:relative so the absolutely-positioned heart anchors here.
          const wrap = document.createElement('div');
          wrap.className = 'rova-menu-item-img-wrap';
          wrap.style.cssText = 'position:relative;display:inline-flex;flex-shrink:0;';
          wrap.appendChild(imgHost);

          const heart = document.createElement('div');
          heart.className = 'rova-menu-item-like';
          // Hard-coded inline size/position — beats any external CSS.
          // Heart sits INSIDE the image corner (right:0/bottom:0) so it never
          // extends past the 48×48 wrapper and the row layout stays identical
          // to unliked items.
          heart.style.cssText =
            'position:absolute;right:0;bottom:0;width:18px;height:18px;' +
            'pointer-events:none;z-index:2;' +
            'filter:drop-shadow(0 1px 2px rgba(0,0,0,0.7));';

          if (m.likeIcon) {
            // Custom icon (costume or URL) — render as <img>
            const img = document.createElement('img');
            img.src = m.likeIcon;
            img.alt = '';
            img.style.cssText = 'width:100%;height:100%;display:block;object-fit:contain;';
            heart.appendChild(img);
          } else {
            // Default: inline pink heart SVG
            heart.innerHTML =
              '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" ' +
              'style="width:100%;height:100%;display:block" aria-hidden="true">' +
              '<path d="M12 21s-7.5-4.6-9.5-9.1C1.2 8.6 3.3 5 6.9 5c2 0 3.6 1 4.5 2.4l.6.9.6-.9C13.5 6 15.1 5 17.1 5c3.6 0 5.7 3.6 4.4 6.9C19.5 16.4 12 21 12 21z" ' +
              'fill="#ff3b7f" stroke="#ffffff" stroke-width="1.2" stroke-linejoin="round"/>' +
              '</svg>';
          }
          // User CSS overrides last
          if (m.likeCSS) heart.style.cssText += ';' + m.likeCSS;

          wrap.appendChild(heart);
          row.appendChild(wrap);
        } else {
          row.appendChild(imgHost);
        }
      }

      // Text
      const textDiv = document.createElement('div');
      textDiv.className = 'rova-menu-item-text';

      const titleWrap = document.createElement('div');
      titleWrap.className = 'rova-menu-item-title';
      if (item.titleCSS) titleWrap.style.cssText = item.titleCSS;

      const clip = document.createElement('div');
      clip.className = 'rova-marquee-clip';

      const track = document.createElement('div');
      track.className = 'rova-marquee-track';

      const part1 = document.createElement('span');
      part1.className = 'rova-marquee-part';
      part1.textContent = item.title || '';

      track.appendChild(part1);
      clip.appendChild(track);
      titleWrap.appendChild(clip);

      // Wait two frames for layout to fully settle before measuring
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const clipW = clip.offsetWidth;
        const textW = part1.offsetWidth;
        if (clipW > 0 && textW > clipW + 16) {
          const part2 = document.createElement('span');
          part2.className = 'rova-marquee-part';
          part2.textContent = item.title || '';
          track.appendChild(part2);
          const dur = Math.max(4, textW / 50);
          track.style.setProperty('--marquee-dur', dur + 's');
          track.classList.add('scrolling');
        }
      }));

      textDiv.appendChild(titleWrap);

      if (item.subtitle) {
        const sub = document.createElement('div');
        sub.className = 'rova-menu-item-subtitle';
        sub.textContent = item.subtitle;
        if (item.subtitleCSS) sub.style.cssText = item.subtitleCSS;
        textDiv.appendChild(sub);
      }
      row.appendChild(textDiv);

      // Right label
      if (item.rightText) {
        const right = document.createElement('div');
        right.className = 'rova-menu-item-right';
        right.textContent = item.rightText;
        if (item.rightCSS) right.style.cssText = item.rightCSS;
        row.appendChild(right);
      }

      // Now playing indicator — match by value (song ID), not position
      const np = m.nowPlaying[m.activeTab];
      const isNowPlaying = np && (
        np.value !== undefined
          ? np.value === item.value   // match by song ID
          : np.index === idx          // fallback to index if no value stored
      );
      if (isNowPlaying) {
        row.classList.add('now-playing');
        const titleEl = row.querySelector('.rova-menu-item-title');
        if (titleEl) { titleEl.classList.add('now-playing'); titleEl.style.color = np.color || 'white'; }
        const bars = document.createElement('div');
        bars.className = 'rova-now-playing-bars' + (np.paused ? ' paused' : '');
        bars.style.setProperty('--bar-color', np.color || 'white');
        bars.innerHTML = '<span style="background:' + (np.color||'white') + '"></span><span style="background:' + (np.color||'white') + '"></span><span style="background:' + (np.color||'white') + '"></span>';
        row.appendChild(bars);
      }

      row.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        m.clickedValue = item.value ?? String(idx + 1);
        m.clickedIndex = idx + 1;
        m._clickQueue++;
        m._boolClickQueue++;
        Scratch.vm.runtime.startHats('rovamenu_whenItemClicked');
      });

      m.listEl.appendChild(row);
    });
  }


  function applyCSS(el, css) {
    if (!el || !css) return;
    css.split(';').forEach(rule => {
      const [prop, ...rest] = rule.split(':');
      if (prop && rest.length) {
        const key = prop.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        el.style[key] = rest.join(':').trim();
      }
    });
  }
  // ── Refresh subtabs for current tab ──────────────────────────────────────────
  function refreshSubtabs(id) {
    const m = menus[id];
    if (!m) return;
    const tab     = m.activeTab;
    const config  = m.subtabConfig?.[tab];
    if (config) {
      // Rebuild subtabs for this tab
      m.subtabsWrap.innerHTML = '';
      m.subtabsWrap.style.display = 'flex';
      if (!m.activeSubtab[tab]) m.activeSubtab[tab] = 0;
      config.forEach((label, i) => {
        const btn = document.createElement('button');
        btn.className = 'rova-menu-subtab-btn' + (i === m.activeSubtab[tab] ? ' active' : '');
        btn.textContent = label;
        btn.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          m.activeSubtab[tab] = i;
          m.subtabsWrap.querySelectorAll('.rova-menu-subtab-btn').forEach((b, j) => {
            b.classList.toggle('active', j === i);
          });
          m.subtabChanged[tab] = true;
          renderList(id);
          Scratch.vm.runtime.startHats('rovamenu_whenSubtabChanged');
        });
        m.subtabsWrap.appendChild(btn);
      });
    } else {
      m.subtabsWrap.innerHTML = '';
      m.subtabsWrap.style.display = 'none';
    }
  }

  // ── Extension ─────────────────────────────────────────────────────────────────
  class RovaMenu {
    getInfo() {
      return {
        id: 'rovamenu',
        name: 'Rova Menu',
        color1: '#5c35cc',
        color2: '#3d2299',
        blocks: [

          // ── Create ───────────────────────────────────────────────────────
          {
            opcode: 'createMenu',
            blockType: BlockType.COMMAND,
            text: 'create menu [ID] width [W] height [H]',
            arguments: {
              ID: { type: ArgumentType.STRING, defaultValue: 'menu1' },
              W:  { type: ArgumentType.NUMBER, defaultValue: 280 },
              H:  { type: ArgumentType.NUMBER, defaultValue: 360 },
            }
          },
          {
            opcode: 'createMenuFull',
            blockType: BlockType.COMMAND,
            text: 'create menu [ID] width [W] height [H] tabs [TABS] search placeholder [PH]',
            arguments: {
              ID:   { type: ArgumentType.STRING, defaultValue: 'menu1' },
              W:    { type: ArgumentType.NUMBER, defaultValue: 280 },
              H:    { type: ArgumentType.NUMBER, defaultValue: 360 },
              TABS: { type: ArgumentType.STRING, defaultValue: '♪,🔖' },
              PH:   { type: ArgumentType.STRING, defaultValue: 'Search music...' },
            }
          },
          {
            opcode: 'setTabIcon',
            blockType: BlockType.COMMAND,
            text: 'set tab [TAB] icon in menu [ID] to costume [COSTUME]',
            arguments: {
              TAB:     { type: ArgumentType.NUMBER, defaultValue: 1 },
              ID:      { type: ArgumentType.STRING, defaultValue: 'menu1' },
              COSTUME: { type: ArgumentType.COSTUME },
            }
          },
          {
            opcode: 'setTabIconURL',
            blockType: BlockType.COMMAND,
            text: 'set tab [TAB] icon in menu [ID] to url [URL]',
            arguments: {
              TAB: { type: ArgumentType.NUMBER, defaultValue: 1 },
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              URL: { type: ArgumentType.STRING, defaultValue: 'https://...' },
            }
          },
          {
            opcode: 'deleteMenu',
            blockType: BlockType.COMMAND,
            text: 'delete menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'showMenu',
            blockType: BlockType.COMMAND,
            text: 'show menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'hideMenu',
            blockType: BlockType.COMMAND,
            text: 'hide menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'setMenuPosition',
            blockType: BlockType.COMMAND,
            text: 'set menu [ID] position x [X] y [Y]',
            arguments: {
              ID: { type: ArgumentType.STRING, defaultValue: 'menu1' },
              X:  { type: ArgumentType.NUMBER, defaultValue: 0 },
              Y:  { type: ArgumentType.NUMBER, defaultValue: 0 },
            }
          },
          {
            opcode: 'setMenuCSS',
            blockType: BlockType.COMMAND,
            text: 'set menu [ID] CSS [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'background: #2b2b2b' },
            }
          },
          '---',

          // ── Items ────────────────────────────────────────────────────────
          {
            opcode: 'clearItems',
            blockType: BlockType.COMMAND,
            text: 'clear items in menu [ID] tab [TAB] subtab [SUBTAB]',
            arguments: {
              ID:     { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB:    { type: ArgumentType.NUMBER, defaultValue: 1 },
              SUBTAB: { type: ArgumentType.NUMBER, defaultValue: 0 },
            }
          },
          {
            opcode: 'addItem',
            blockType: BlockType.COMMAND,
            text: 'add item to menu [ID] tab [TAB] subtab [SUBTAB] title [TITLE] subtitle [SUB] image [IMG] value [VAL]',
            arguments: {
              ID:     { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB:    { type: ArgumentType.NUMBER, defaultValue: 1 },
              SUBTAB: { type: ArgumentType.NUMBER, defaultValue: 0 },
              TITLE:  { type: ArgumentType.STRING, defaultValue: 'Song Name' },
              SUB:    { type: ArgumentType.STRING, defaultValue: 'Artist' },
              IMG:    { type: ArgumentType.STRING, defaultValue: '' },
              VAL:    { type: ArgumentType.STRING, defaultValue: '1' },
            }
          },
          {
            opcode: 'addItemRight',
            blockType: BlockType.COMMAND,
            text: 'add item to menu [ID] tab [TAB] subtab [SUBTAB] title [TITLE] subtitle [SUB] image [IMG] right text [RIGHT] value [VAL]',
            arguments: {
              ID:     { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB:    { type: ArgumentType.NUMBER, defaultValue: 1 },
              SUBTAB: { type: ArgumentType.NUMBER, defaultValue: 0 },
              TITLE:  { type: ArgumentType.STRING, defaultValue: 'Song Name' },
              SUB:    { type: ArgumentType.STRING, defaultValue: 'Artist' },
              IMG:    { type: ArgumentType.STRING, defaultValue: '' },
              RIGHT:  { type: ArgumentType.STRING, defaultValue: '3:45' },
              VAL:    { type: ArgumentType.STRING, defaultValue: '1' },
            }
          },
          {
            opcode: 'setItemCSS',
            blockType: BlockType.COMMAND,
            text: 'set item [INDEX] CSS in menu [ID] tab [TAB] to [CSS]',
            arguments: {
              INDEX: { type: ArgumentType.NUMBER, defaultValue: 1 },
              ID:    { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB:   { type: ArgumentType.NUMBER, defaultValue: 1 },
              CSS:   { type: ArgumentType.STRING, defaultValue: '' },
            }
          },
          {
            opcode: 'renderItems',
            blockType: BlockType.COMMAND,
            text: 'render items in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'addItemsJSON',
            blockType: BlockType.COMMAND,
            text: 'add items to menu [ID] tab [TAB] subtab [SUBTAB] from JSON [JSON]',
            arguments: {
              ID:     { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB:    { type: ArgumentType.NUMBER, defaultValue: 1 },
              SUBTAB: { type: ArgumentType.NUMBER, defaultValue: 0 },
              JSON:   { type: ArgumentType.STRING, defaultValue: '[{"title":"Song","subtitle":"Artist","image":"","value":"1"}]' },
            }
          },
          '---',

          // ── Events ───────────────────────────────────────────────────────
          {
            opcode: 'whenItemClicked',
            blockType: BlockType.HAT,
            text: 'when item clicked in menu [ID]',
            isEdgeActivated: false,
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'clickedValue',
            blockType: BlockType.REPORTER,
            text: 'clicked item value in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'clickedIndex',
            blockType: BlockType.REPORTER,
            text: 'clicked item index in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'resetClick',
            blockType: BlockType.COMMAND,
            text: 'reset clicked item in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'itemWasClicked',
            blockType: BlockType.BOOLEAN,
            text: 'item was clicked in menu [ID]?',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          '---',

          // ── Search ───────────────────────────────────────────────────────
          {
            opcode: 'searchValue',
            blockType: BlockType.REPORTER,
            text: 'search text in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'whenSearchChanged',
            blockType: BlockType.HAT,
            text: 'when search changes in menu [ID]',
            isEdgeActivated: false,
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'whenSearchEntered',
            blockType: BlockType.HAT,
            text: 'when Enter pressed in search in menu [ID]',
            isEdgeActivated: false,
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'setSearchText',
            blockType: BlockType.COMMAND,
            text: 'set search text in menu [ID] to [TEXT]',
            arguments: {
              ID:   { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TEXT: { type: ArgumentType.STRING, defaultValue: '' },
            }
          },
          {
            opcode: 'searchWasChanged',
            blockType: BlockType.BOOLEAN,
            text: 'search was changed in menu [ID]?',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'searchWasEntered',
            blockType: BlockType.BOOLEAN,
            text: 'Enter was pressed in search in menu [ID]?',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          '---',

          // ── Tabs ─────────────────────────────────────────────────────────
          {
            opcode: 'activeTab',
            blockType: BlockType.REPORTER,
            text: 'active tab in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'setActiveTab',
            blockType: BlockType.COMMAND,
            text: 'set active tab in menu [ID] to [TAB]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB: { type: ArgumentType.NUMBER, defaultValue: 1 },
            }
          },
          '---',

          // ── Loading ──────────────────────────────────────────────────────
          {
            opcode: 'showLoading',
            blockType: BlockType.COMMAND,
            text: 'show loading in menu [ID] with message [MSG]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              MSG: { type: ArgumentType.STRING, defaultValue: 'Loading...' },
            }
          },
          {
            opcode: 'hideLoading',
            blockType: BlockType.COMMAND,
            text: 'hide loading in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'setLoadingMessage',
            blockType: BlockType.COMMAND,
            text: 'set loading message in menu [ID] to [MSG]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              MSG: { type: ArgumentType.STRING, defaultValue: 'Loading...' },
            }
          },
          {
            opcode: 'setLoadingCSS',
            blockType: BlockType.COMMAND,
            text: 'set loading CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'background: #1a1a1a' },
            }
          },
          {
            opcode: 'setSpinnerCSS',
            blockType: BlockType.COMMAND,
            text: 'set spinner CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'border-top-color: white' },
            }
          },
          {
            opcode: 'setLoadingTextCSS',
            blockType: BlockType.COMMAND,
            text: 'set loading text CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'color: white' },
            }
          },
          '---',

          // ── Subtabs ──────────────────────────────────────────────────────
          {
            opcode: 'setSubtabs',
            blockType: BlockType.COMMAND,
            text: 'set subtabs in menu [ID] tab [TAB] to [LABELS]',
            arguments: {
              ID:     { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB:    { type: ArgumentType.NUMBER, defaultValue: 1 },
              LABELS: { type: ArgumentType.STRING, defaultValue: 'Trending,For You' },
            }
          },
          {
            opcode: 'hideSubtabs',
            blockType: BlockType.COMMAND,
            text: 'hide subtabs in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'activeSubtab',
            blockType: BlockType.REPORTER,
            text: 'active subtab in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'setActiveSubtab',
            blockType: BlockType.COMMAND,
            text: 'set active subtab in menu [ID] to [N]',
            arguments: {
              ID: { type: ArgumentType.STRING, defaultValue: 'menu1' },
              N:  { type: ArgumentType.NUMBER, defaultValue: 1 },
            }
          },
          {
            opcode: 'whenSubtabChanged',
            blockType: BlockType.HAT,
            text: 'when subtab changes in menu [ID]',
            isEdgeActivated: false,
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'subtabWasChanged',
            blockType: BlockType.BOOLEAN,
            text: 'subtab was changed in menu [ID]?',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          '---',

          // ── Now playing ──────────────────────────────────────────────────
          {
            opcode: 'setNowPlaying',
            blockType: BlockType.COMMAND,
            text: 'set item with value [VAL] in menu [ID] tab [TAB] as now playing color [COLOR]',
            arguments: {
              VAL:   { type: ArgumentType.STRING, defaultValue: '1' },
              ID:    { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB:   { type: ArgumentType.NUMBER, defaultValue: 1 },
              COLOR: { type: ArgumentType.COLOR },
            }
          },
          {
            opcode: 'clearNowPlaying',
            blockType: BlockType.COMMAND,
            text: 'clear now playing in menu [ID] tab [TAB]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB: { type: ArgumentType.NUMBER, defaultValue: 1 },
            }
          },
          {
            opcode: 'setNowPlayingPaused',
            blockType: BlockType.COMMAND,
            text: 'set now playing bars in menu [ID] to [STATE]',
            arguments: {
              ID:    { type: ArgumentType.STRING, defaultValue: 'menu1' },
              STATE: { type: ArgumentType.STRING, menu: 'playPauseMenu' },
            }
          },
          '---',

          // ── Skeleton ─────────────────────────────────────────────────────
          {
            opcode: 'addSkeletonItems',
            blockType: BlockType.COMMAND,
            text: 'add [COUNT] skeleton items to menu [ID] tab [TAB]',
            arguments: {
              COUNT: { type: ArgumentType.NUMBER, defaultValue: 3 },
              ID:    { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB:   { type: ArgumentType.NUMBER, defaultValue: 1 },
            }
          },
          {
            opcode: 'setItemSkeleton',
            blockType: BlockType.COMMAND,
            text: 'set item [INDEX] in menu [ID] tab [TAB] to skeleton [ON]',
            arguments: {
              INDEX: { type: ArgumentType.NUMBER, defaultValue: 1 },
              ID:    { type: ArgumentType.STRING, defaultValue: 'menu1' },
              TAB:   { type: ArgumentType.NUMBER, defaultValue: 1 },
              ON:    { type: ArgumentType.STRING, menu: 'onOffMenu' },
            }
          },
          '---',

          // ── Feature CSS ──────────────────────────────────────────────────
          {
            opcode: 'setSkeletonCSS',
            blockType: BlockType.COMMAND,
            text: 'set skeleton block CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'border-radius: 4px' },
            }
          },
          {
            opcode: 'setSkeletonImgCSS',
            blockType: BlockType.COMMAND,
            text: 'set skeleton image CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'border-radius: 8px' },
            }
          },
          {
            opcode: 'setSkeletonTitleCSS',
            blockType: BlockType.COMMAND,
            text: 'set skeleton title CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'height: 12px' },
            }
          },
          {
            opcode: 'setSkeletonSubCSS',
            blockType: BlockType.COMMAND,
            text: 'set skeleton subtitle CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'height: 10px' },
            }
          },
          {
            opcode: 'setNowPlayingRowCSS',
            blockType: BlockType.COMMAND,
            text: 'set now playing row CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'background: rgba(255,255,255,0.04)' },
            }
          },
          {
            opcode: 'setNowPlayingBarsCSS',
            blockType: BlockType.COMMAND,
            text: 'set now playing bars CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'gap: 2px; height: 14px' },
            }
          },
          {
            opcode: 'setNowPlayingTitleCSS',
            blockType: BlockType.COMMAND,
            text: 'set now playing title CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'font-weight: 600' },
            }
          },
          '---',

          // ── Likes (heart badge on items) ──────────────────────────────────
          {
            opcode: 'likeItem',
            blockType: BlockType.COMMAND,
            text: 'like item with value [VAL] in menu [ID]',
            arguments: {
              VAL: { type: ArgumentType.STRING, defaultValue: '1' },
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
            }
          },
          {
            opcode: 'unlikeItem',
            blockType: BlockType.COMMAND,
            text: 'unlike item with value [VAL] in menu [ID]',
            arguments: {
              VAL: { type: ArgumentType.STRING, defaultValue: '1' },
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
            }
          },
          {
            opcode: 'setLikedItems',
            blockType: BlockType.COMMAND,
            text: 'set liked item values in menu [ID] to JSON list [LIST]',
            arguments: {
              ID:   { type: ArgumentType.STRING, defaultValue: 'menu1' },
              LIST: { type: ArgumentType.STRING, defaultValue: '["1","2"]' },
            }
          },
          {
            opcode: 'clearLikes',
            blockType: BlockType.COMMAND,
            text: 'clear all liked items in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'isItemLiked',
            blockType: BlockType.BOOLEAN,
            text: 'is item with value [VAL] liked in menu [ID]?',
            arguments: {
              VAL: { type: ArgumentType.STRING, defaultValue: '1' },
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
            }
          },
          {
            opcode: 'likedItemsJSON',
            blockType: BlockType.REPORTER,
            text: 'liked item values in menu [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          {
            opcode: 'setLikeCSS',
            blockType: BlockType.COMMAND,
            text: 'set like icon CSS in menu [ID] to [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'right: -4px; bottom: -4px; width: 20px; height: 20px' },
            }
          },
          {
            opcode: 'setLikeIconCostume',
            blockType: BlockType.COMMAND,
            text: 'set like icon in menu [ID] to costume [COSTUME]',
            arguments: {
              ID:      { type: ArgumentType.STRING, defaultValue: 'menu1' },
              COSTUME: { type: ArgumentType.COSTUME },
            }
          },
          {
            opcode: 'setLikeIconURL',
            blockType: BlockType.COMMAND,
            text: 'set like icon in menu [ID] to URL [URL]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'menu1' },
              URL: { type: ArgumentType.STRING, defaultValue: 'https://...' },
            }
          },
          {
            opcode: 'resetLikeIcon',
            blockType: BlockType.COMMAND,
            text: 'reset like icon in menu [ID] to default heart',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'menu1' } }
          },
          '---',

          // ── Inject global CSS ─────────────────────────────────────────────
          {
            opcode: 'injectCSS',
            blockType: BlockType.COMMAND,
            text: 'inject global CSS [CSS]',
            arguments: { CSS: { type: ArgumentType.STRING, defaultValue: '.rova-menu { }' } }
          },
        ],
        menus: {
          onOffMenu:     { acceptReporters: false, items: ['on', 'off'] },
          playPauseMenu: { acceptReporters: false, items: ['playing', 'paused'] }
        }
      };
    }

    // ── Create ─────────────────────────────────────────────────────────────────
    setTabIcon({ TAB, ID, COSTUME }, util) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const idx = Cast.toNumber(TAB) - 1;
      const btn = m.el.querySelectorAll('.rova-menu-tab-btn')[idx];
      if (!btn) return;
      try {
        const target  = util.target;
        const costume = target.getCostumes().find(c => c.name === COSTUME);
        if (!costume) return;
        let uri;
        if (costume.dataFormat === 'svg') {
          const svgStr = new TextDecoder().decode(costume.asset.data);
          const b64    = btoa(unescape(encodeURIComponent(svgStr)));
          uri = 'data:image/svg+xml;base64,' + b64;
        } else {
          uri = costume.asset.encodeDataURI();
        }
        btn.innerHTML = '<img src="' + uri + '" width="16" height="16" style="pointer-events:none">';
      } catch(e) { console.warn('setTabIcon error', e); }
    }

    setTabIconURL({ TAB, ID, URL }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const idx = Cast.toNumber(TAB) - 1;
      const btn = m.el.querySelectorAll('.rova-menu-tab-btn')[idx];
      if (!btn) return;
      btn.innerHTML = '<img src="' + Cast.toString(URL) + '" width="16" height="16" style="pointer-events:none">';
    }

    createMenu({ ID, W, H }) {
      const id = Cast.toString(ID);
      buildMenu(id, {
        width: Cast.toNumber(W),
        height: Cast.toNumber(H),
        tabs: [{ icon: '♪' }, { icon: '🔖' }],
        searchPlaceholder: 'Search music...'
      });
    }

    createMenuFull({ ID, W, H, TABS, PH }) {
      const id   = Cast.toString(ID);
      const tabIcons = Cast.toString(TABS).split(',').map(t => ({ icon: t.trim() }));
      buildMenu(id, {
        width: Cast.toNumber(W),
        height: Cast.toNumber(H),
        tabs: tabIcons,
        searchPlaceholder: Cast.toString(PH)
      });
    }

    deleteMenu({ ID }) {
      const id = Cast.toString(ID);
      if (menus[id]) { menus[id].el.remove(); delete menus[id]; }
    }

    showMenu({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m) m.el.style.display = 'flex';
    }

    hideMenu({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m) m.el.style.display = 'none';
    }

    setMenuPosition({ ID, X, Y }) {
      const id = Cast.toString(ID);
      const x = Cast.toNumber(X);
      const y = Cast.toNumber(Y);
      const apply = () => {
        const m = menus[id];
        if (!m) return false;
        const vm = Scratch.vm;
        const sw = vm.runtime.stageWidth;
        const sh = vm.runtime.stageHeight;
        const h  = parseFloat(m.el.style.height) || 360;
        m.el.style.left = (sw / 2 + x) + 'px';
        m.el.style.top  = (sh / 2 - y - h) + 'px';
        // Store the requested position so we can re-apply if the menu rebuilds
        m._pos = { x, y };
        return true;
      };
      if (apply()) return;
      // Menu doesn't exist yet — retry a few times. This handles the
      // common packager race condition where "set position" runs in the
      // same tick as "create menu" before the DOM is in place.
      let tries = 0;
      const timer = setInterval(() => {
        if (apply() || ++tries > 20) clearInterval(timer);
      }, 50);
    }

    setMenuCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (m) m.el.style.cssText += ';' + Cast.toString(CSS);
    }

    // ── Items ──────────────────────────────────────────────────────────────────
    clearItems({ ID, TAB, SUBTAB }) {
      const m   = menus[Cast.toString(ID)];
      if (!m) return;
      const tab    = Cast.toNumber(TAB) - 1;
      const subtab = Cast.toNumber(SUBTAB);
      m.items[tab + ':' + subtab] = [];
    }

    addItem({ ID, TAB, SUBTAB, TITLE, SUB, IMG, VAL }) {
      const m   = menus[Cast.toString(ID)];
      if (!m) return;
      const tab    = Cast.toNumber(TAB) - 1;
      const subtab = Cast.toNumber(SUBTAB); // 0 = no subtab
      const key    = tab + ':' + subtab;
      if (!m.items[key]) m.items[key] = [];
      m.items[key].push({
        title:    Cast.toString(TITLE),
        subtitle: Cast.toString(SUB),
        image:    Cast.toString(IMG) || null,
        value:    Cast.toString(VAL),
      });
    }

    addItemRight({ ID, TAB, SUBTAB, TITLE, SUB, IMG, RIGHT, VAL }) {
      const m   = menus[Cast.toString(ID)];
      if (!m) return;
      const tab    = Cast.toNumber(TAB) - 1;
      const subtab = Cast.toNumber(SUBTAB);
      const key    = tab + ':' + subtab;
      if (!m.items[key]) m.items[key] = [];
      m.items[key].push({
        title:     Cast.toString(TITLE),
        subtitle:  Cast.toString(SUB),
        image:     Cast.toString(IMG) || null,
        rightText: Cast.toString(RIGHT),
        value:     Cast.toString(VAL),
      });
    }

    setItemCSS({ INDEX, ID, TAB, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const tab = Cast.toNumber(TAB) - 1;
      const idx = Cast.toNumber(INDEX) - 1;
      if (m.items[tab] && m.items[tab][idx]) {
        m.items[tab][idx].css = Cast.toString(CSS);
      }
    }

    renderItems({ ID }) {
      renderList(Cast.toString(ID));
    }

    addItemsJSON({ ID, TAB, SUBTAB, JSON: JSON_STR }) {
      const m   = menus[Cast.toString(ID)];
      if (!m) return;
      const tab    = Cast.toNumber(TAB) - 1;
      const subtab = Cast.toNumber(SUBTAB);
      const key    = tab + ':' + subtab;
      if (!m.items[key]) m.items[key] = [];

      let arr = [];
      try {
        const parsed = JSON.parse(Cast.toString(JSON_STR));
        if (Array.isArray(parsed)) arr = parsed;
      } catch (e) {
        console.warn('addItemsJSON: invalid JSON', e);
        return;
      }

      arr.forEach(it => {
        if (!it || typeof it !== 'object') return;
        // Accept either explicit fields (title/subtitle/image/value) OR
        // common alternates from APIs like SoundCloud:
        //   name → title, artist → subtitle, cover → image, id → value
        const title    = it.title    ?? it.name     ?? '';
        const subtitle = it.subtitle ?? it.artist   ?? it.author   ?? '';
        const image    = it.image    ?? it.cover    ?? it.thumbnail ?? it.artwork ?? null;
        const value    = it.value    ?? it.id       ?? it.ID        ?? '';
        const entry = {
          title:    String(title),
          subtitle: String(subtitle),
          image:    image ? String(image) : null,
          value:    String(value),
        };
        // Optional fields — only set if present
        const right = it.rightText ?? it.duration ?? it.right;
        if (right !== undefined && right !== null) entry.rightText = String(right);
        if (it.css !== undefined)       entry.css       = String(it.css);
        if (it.titleCSS !== undefined)  entry.titleCSS  = String(it.titleCSS);
        if (it.subtitleCSS !== undefined) entry.subtitleCSS = String(it.subtitleCSS);
        if (it.imageCSS !== undefined)  entry.imageCSS  = String(it.imageCSS);
        if (it.rightCSS !== undefined)  entry.rightCSS  = String(it.rightCSS);
        if (it.showPlaceholder === true) entry.showPlaceholder = true;
        if (it.placeholderCSS !== undefined) entry.placeholderCSS = String(it.placeholderCSS);
        // If item has "liked": true, also add its value to the likes set
        if (it.liked === true && entry.value) m.likes.add(entry.value);
        m.items[key].push(entry);
      });
    }

    // ── Events ─────────────────────────────────────────────────────────────────
    whenItemClicked({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m && m._clickQueue > 0) {
        m._clickQueue--;
        return true;
      }
      return false;
    }

    clickedValue({ ID }) {
      const m = menus[Cast.toString(ID)];
      return m ? (m.clickedValue ?? '') : '';
    }

    clickedIndex({ ID }) {
      const m = menus[Cast.toString(ID)];
      return m ? (m.clickedIndex ?? 0) : 0;
    }

    resetClick({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m) { m.clickedValue = null; m.clickedIndex = null; m._clickQueue = 0; m._boolClickQueue = 0; }
    }

    // ── Search ─────────────────────────────────────────────────────────────────
    searchValue({ ID }) {
      const m = menus[Cast.toString(ID)];
      return m ? m.searchValue : '';
    }

    whenSearchChanged({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m && m._searchChangedQueue > 0) {
        m._searchChangedQueue--;
        return true;
      }
      return false;
    }

    whenSearchEntered({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m && m._searchEnteredQueue > 0) {
        m._searchEnteredQueue--;
        return true;
      }
      return false;
    }

    setSearchText({ ID, TEXT }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const input = m.el.querySelector('.rova-menu-search');
      if (input) { input.value = Cast.toString(TEXT); m.searchValue = Cast.toString(TEXT); }
    }

    itemWasClicked({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m && m._boolClickQueue > 0) {
        m._boolClickQueue--;
        return true;
      }
      return false;
    }

    searchWasChanged({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m && m._boolSearchChangedQueue > 0) {
        m._boolSearchChangedQueue--;
        return true;
      }
      return false;
    }

    searchWasEntered({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m && m._boolSearchEnteredQueue > 0) {
        m._boolSearchEnteredQueue--;
        return true;
      }
      return false;
    }

    // ── Tabs ───────────────────────────────────────────────────────────────────
    activeTab({ ID }) {
      const m = menus[Cast.toString(ID)];
      return m ? (m.activeTab + 1) : 1;
    }

    setActiveTab({ ID, TAB }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const idx = Cast.toNumber(TAB) - 1;
      m.activeTab = idx;
      const btns = m.el.querySelectorAll('.rova-menu-tab-btn');
      const inds = m.el.querySelectorAll('.rova-menu-tab-indicator');
      btns.forEach((b, i) => b.classList.toggle('active', i === idx));
      inds.forEach((d, i) => d.classList.toggle('active', i === idx));
      renderList(Cast.toString(ID));
    }

    // ── Loading ────────────────────────────────────────────────────────────────
    showLoading({ ID, MSG }) {
      const m = menus[Cast.toString(ID)];
      if (!m || !m.loadingEl) return;
      const txt = m.loadingEl.querySelector('.rova-menu-loading-text');
      if (txt) txt.textContent = Cast.toString(MSG);
      m.loadingEl.classList.add('visible');
    }

    hideLoading({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (!m || !m.loadingEl) return;
      m.loadingEl.classList.remove('visible');
    }

    setLoadingMessage({ ID, MSG }) {
      const m = menus[Cast.toString(ID)];
      if (!m || !m.loadingEl) return;
      const txt = m.loadingEl.querySelector('.rova-menu-loading-text');
      if (txt) txt.textContent = Cast.toString(MSG);
    }

    setLoadingCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m || !m.loadingEl) return;
      Cast.toString(CSS).split(';').forEach(rule => {
        const [prop, ...rest] = rule.split(':');
        if (prop && rest.length) {
          const key = prop.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          if (key !== 'display') m.loadingEl.style[key] = rest.join(':').trim();
        }
      });
    }

    setSpinnerCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m || !m.loadingEl) return;
      applyCSS(m.loadingEl.querySelector('.rova-menu-spinner'), Cast.toString(CSS));
    }

    setLoadingTextCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m || !m.loadingEl) return;
      applyCSS(m.loadingEl.querySelector('.rova-menu-loading-text'), Cast.toString(CSS));
    }

    // ── Subtabs ────────────────────────────────────────────────────────────────
    setSubtabs({ ID, TAB, LABELS }) {
      const m      = menus[Cast.toString(ID)];
      if (!m) return;
      const tabIdx = Cast.toNumber(TAB) - 1;
      const labels = Cast.toString(LABELS).split(',').map(l => l.trim()).filter(l => l);
      if (!labels.length) return;
      // Store config for this tab
      m.subtabConfig[tabIdx] = labels;
      // Only show if this tab is currently active
      if (m.activeTab === tabIdx) refreshSubtabs(Cast.toString(ID));
    }

    hideSubtabs({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (m) m.subtabsWrap.style.display = 'none';
    }

    activeSubtab({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return 1;
      const tab = m.activeTab;
      return (m.activeSubtab[tab] ?? 0) + 1;
    }

    setActiveSubtab({ ID, N }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const tab = m.activeTab;
      const idx = Cast.toNumber(N) - 1;
      m.activeSubtab[tab] = idx;
      m.subtabsWrap.querySelectorAll('.rova-menu-subtab-btn').forEach((b, j) => {
        b.classList.toggle('active', j === idx);
      });
      renderList(Cast.toString(ID));
    }

    whenSubtabChanged({ ID }) {
      const m   = menus[Cast.toString(ID)];
      const tab = m?.activeTab ?? 0;
      if (m && m.subtabChanged[tab]) { m.subtabChanged[tab] = false; return true; }
      return false;
    }

    subtabWasChanged({ ID }) {
      const m   = menus[Cast.toString(ID)];
      const tab = m?.activeTab ?? 0;
      if (m && m.subtabChanged[tab]) { m.subtabChanged[tab] = false; return true; }
      return false;
    }

    // ── Now playing ────────────────────────────────────────────────────────────
    setNowPlaying({ VAL, ID, TAB, COLOR }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const tab      = Cast.toNumber(TAB) - 1;
      const val      = Cast.toString(VAL);
      const existing = m.nowPlaying[tab] || {};

      // Search across all subtabs for the matching value
      let foundIdx = -1;
      for (let s = 0; s <= 10; s++) {
        const key   = tab + ':' + s;
        const items = m.items[key] || [];
        const idx   = items.findIndex(item => item.value === val);
        if (idx !== -1) { foundIdx = idx; break; }
      }
      // Also check legacy tab-only key
      if (foundIdx === -1) {
        const items = m.items[tab] || [];
        foundIdx = items.findIndex(item => item.value === val);
      }

      m.nowPlaying[tab] = { index: foundIdx, value: val, color: Cast.toString(COLOR), paused: existing.paused || false };
      renderList(Cast.toString(ID));
    }

    clearNowPlaying({ ID, TAB }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const tab = Cast.toNumber(TAB) - 1;
      delete m.nowPlaying[tab];
      renderList(Cast.toString(ID));
    }

    setNowPlayingPaused({ ID, STATE }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const paused = Cast.toString(STATE) === 'paused';
      Object.keys(m.nowPlaying).forEach(tab => {
        m.nowPlaying[tab].paused = paused;
      });
      // Update bars directly without full re-render
      m.el.querySelectorAll('.rova-now-playing-bars').forEach(bars => {
        bars.classList.toggle('paused', paused);
      });
    }

    // ── Skeleton ───────────────────────────────────────────────────────────────
    addSkeletonItems({ COUNT, ID, TAB }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const tab = Cast.toNumber(TAB) - 1;
      if (!m.items[tab]) m.items[tab] = [];
      const count = Math.max(1, Math.min(20, Cast.toNumber(COUNT)));
      for (let i = 0; i < count; i++) {
        m.items[tab].push({ _skeleton: true, value: '' });
      }
    }

    setItemSkeleton({ INDEX, ID, TAB, ON }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      const tab = Cast.toNumber(TAB) - 1;
      const idx = Cast.toNumber(INDEX) - 1;
      if (!m.items[tab] || !m.items[tab][idx]) return;
      m.items[tab][idx]._skeleton = Cast.toString(ON) === 'on';
    }

    // ── Feature CSS ────────────────────────────────────────────────────────────
    setSkeletonCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.el.querySelectorAll('.rova-skeleton-block').forEach(el => applyCSS(el, Cast.toString(CSS)));
    }

    setSkeletonImgCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.el.querySelectorAll('.rova-skeleton-img').forEach(el => applyCSS(el, Cast.toString(CSS)));
    }

    setSkeletonTitleCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.el.querySelectorAll('.rova-skeleton-title').forEach(el => applyCSS(el, Cast.toString(CSS)));
    }

    setSkeletonSubCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.el.querySelectorAll('.rova-skeleton-sub').forEach(el => applyCSS(el, Cast.toString(CSS)));
    }

    setNowPlayingRowCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.el.querySelectorAll('.rova-menu-item.now-playing').forEach(el => applyCSS(el, Cast.toString(CSS)));
    }

    setNowPlayingBarsCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.el.querySelectorAll('.rova-now-playing-bars').forEach(el => applyCSS(el, Cast.toString(CSS)));
    }

    setNowPlayingTitleCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.el.querySelectorAll('.rova-menu-item-title.now-playing').forEach(el => applyCSS(el, Cast.toString(CSS)));
    }

    // ── Likes ──────────────────────────────────────────────────────────────────
    likeItem({ VAL, ID }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.likes.add(Cast.toString(VAL));
      renderList(Cast.toString(ID));
    }

    unlikeItem({ VAL, ID }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.likes.delete(Cast.toString(VAL));
      renderList(Cast.toString(ID));
    }

    setLikedItems({ ID, LIST }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      let arr = [];
      try {
        const parsed = JSON.parse(Cast.toString(LIST));
        if (Array.isArray(parsed)) arr = parsed;
      } catch (e) {
        // Fallback: comma-separated string
        arr = Cast.toString(LIST).split(',').map(s => s.trim()).filter(Boolean);
      }
      m.likes = new Set(arr.map(v => String(v)));
      renderList(Cast.toString(ID));
    }

    clearLikes({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.likes.clear();
      renderList(Cast.toString(ID));
    }

    isItemLiked({ VAL, ID }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return false;
      return m.likes.has(Cast.toString(VAL));
    }

    likedItemsJSON({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return '[]';
      return JSON.stringify(Array.from(m.likes));
    }

    setLikeCSS({ ID, CSS }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.likeCSS = Cast.toString(CSS);
      renderList(Cast.toString(ID));
    }

    setLikeIconCostume({ ID, COSTUME }, util) {
      const id = Cast.toString(ID);
      const costumeName = Cast.toString(COSTUME);
      const apply = () => {
        const m = menus[id];
        if (!m) return false;
        try {
          const target = (util && util.target) || (Scratch.vm && Scratch.vm.runtime.getEditingTarget && Scratch.vm.runtime.getEditingTarget());
          if (!target) return false;
          const costumes = target.getCostumes ? target.getCostumes() : (target.sprite && target.sprite.costumes);
          if (!costumes) return false;
          const costume = costumes.find(c => c.name === costumeName);
          if (!costume) {
            console.warn('[rovamenu] costume not found:', costumeName, '— available:', costumes.map(c => c.name).join(', '));
            return false;
          }
          let uri;
          if (costume.dataFormat === 'svg' || (costume.asset && costume.asset.assetType && costume.asset.assetType.runtimeFormat === 'svg')) {
            const data = costume.asset.data;
            const svgStr = (typeof data === 'string') ? data : new TextDecoder().decode(data);
            const b64    = btoa(unescape(encodeURIComponent(svgStr)));
            uri = 'data:image/svg+xml;base64,' + b64;
          } else if (costume.asset && typeof costume.asset.encodeDataURI === 'function') {
            uri = costume.asset.encodeDataURI();
          } else {
            return false;
          }
          m.likeIcon = uri;
          renderList(id);
          return true;
        } catch (e) {
          console.warn('[rovamenu] setLikeIconCostume error:', e);
          return false;
        }
      };
      if (apply()) return;
      // Menu doesn't exist yet — retry a few times (packager race)
      let tries = 0;
      const timer = setInterval(() => {
        if (apply() || ++tries > 20) clearInterval(timer);
      }, 50);
    }

    setLikeIconURL({ ID, URL }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.likeIcon = Cast.toString(URL);
      renderList(Cast.toString(ID));
    }

    resetLikeIcon({ ID }) {
      const m = menus[Cast.toString(ID)];
      if (!m) return;
      m.likeIcon = null;
      renderList(Cast.toString(ID));
    }

    // ── Global CSS ─────────────────────────────────────────────────────────────
    injectCSS({ CSS }) {
      const style = document.createElement('style');
      style.textContent = Cast.toString(CSS);
      document.head.appendChild(style);
    }
  }

  Scratch.extensions.register(new RovaMenu());
})(Scratch);
