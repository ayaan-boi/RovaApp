// Rova SoundCloud Comments Extension
// Displays comments in SoundCloud's style

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Rova SC Comments requires unsandboxed mode.");
  }

  const { BlockType, ArgumentType, Cast } = Scratch;

  const SC_ORANGE = "#ff5500";

  let panels = {};

  function injectStyles() {
    if (document.getElementById('rova-sc-comments-styles')) return;
    const style = document.createElement('style');
    style.id = 'rova-sc-comments-styles';
    style.textContent = `
      .rova-sc-panel {
        position: absolute;
        display: flex;
        flex-direction: column;
        background: #1a1a1a;
        border-radius: 0px;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
        pointer-events: auto;
        user-select: none;
        z-index: 999;
        color: white;
      }

      /* ── Scroll list ── */
      .rova-sc-list {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px 0;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.1) transparent;
      }
      .rova-sc-list::-webkit-scrollbar { width: 4px; }
      .rova-sc-list::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.1);
        border-radius: 2px;
      }

      /* ── Comment item ── */
      .rova-sc-item {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .rova-sc-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
        background: #333;
      }
      .rova-sc-avatar-ph {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #333;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 600;
        color: rgba(255,255,255,0.5);
      }

      .rova-sc-body { flex: 1; min-width: 0; }

      .rova-sc-meta {
        font-size: 12px;
        margin-bottom: 5px;
        line-height: 1.4;
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 3px;
      }
      .rova-sc-author {
        font-weight: 700;
        color: white;
        font-size: 12px;
      }
      .rova-sc-at {
        color: rgba(255,255,255,0.4);
        font-size: 12px;
        font-weight: 400;
      }
      .rova-sc-timestamp {
        color: ${SC_ORANGE};
        font-weight: 700;
        font-size: 12px;
        cursor: pointer;
      }
      .rova-sc-timestamp:hover { text-decoration: underline; }
      .rova-sc-dot {
        color: rgba(255,255,255,0.3);
        font-size: 12px;
      }
      .rova-sc-time {
        color: rgba(255,255,255,0.4);
        font-size: 12px;
      }

      .rova-sc-text {
        font-size: 13px;
        color: rgba(255,255,255,0.85);
        line-height: 1.5;
        margin-bottom: 6px;
        word-break: break-word;
        white-space: pre-wrap;
      }

      .rova-sc-reply-btn {
        background: none;
        border: none;
        color: rgba(255,255,255,0.4);
        font-size: 12px;
        font-family: inherit;
        padding: 0;
        cursor: pointer;
        font-weight: 500;
        transition: color 0.15s;
        pointer-events: auto;
      }
      .rova-sc-reply-btn:hover { color: white; }

      /* ── Loading overlay ── */
      .rova-sc-loading {
        display: none;
        position: absolute;
        inset: 0;
        background: rgba(26,26,26,0.9);
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 10px;
        z-index: 20;
      }
      .rova-sc-loading.visible { display: flex; }
      .rova-sc-spinner {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 3px solid rgba(255,85,0,0.2);
        border-top-color: ${SC_ORANGE};
        animation: rova-sc-spin 0.7s linear infinite;
      }
      .rova-sc-loading-text {
        color: rgba(255,255,255,0.45);
        font-size: 12px;
      }
      @keyframes rova-sc-spin { to { transform: rotate(360deg); } }

      /* ── Empty state ── */
      .rova-sc-empty {
        display: none;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        color: rgba(255,255,255,0.3);
        font-size: 12px;
      }
      .rova-sc-empty.visible { display: flex; }
    `;
    document.head.appendChild(style);
  }

  function getOverlay() {
    let overlay = document.querySelector('.LordCatInterfaces');
    if (!overlay) {
      overlay = document.getElementById('rova-sc-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'rova-sc-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
        try { Scratch.vm.renderer.addOverlay(overlay, 'scale'); }
        catch(e) { document.body.appendChild(overlay); }
      }
    }
    return overlay;
  }

  function formatTimestamp(seconds) {
    const s = Math.floor(Cast.toNumber(seconds));
    if (isNaN(s) || s < 0) return null;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ":" + String(sec).padStart(2, "0");
  }

  function formatRelativeTime(isoStr) {
    if (!isoStr) return "";
    try {
      const diff = Date.now() - new Date(isoStr).getTime();
      const s    = Math.floor(diff / 1000);
      if (s < 60)  return s + " seconds ago";
      const m = Math.floor(s / 60);
      if (m < 60)  return m + " minute"  + (m  !== 1 ? "s" : "") + " ago";
      const h = Math.floor(m / 60);
      if (h < 24)  return h + " hour"    + (h  !== 1 ? "s" : "") + " ago";
      const d = Math.floor(h / 24);
      if (d < 30)  return d + " day"     + (d  !== 1 ? "s" : "") + " ago";
      const mo = Math.floor(d / 30);
      if (mo < 12) return mo + " month"  + (mo !== 1 ? "s" : "") + " ago";
      const y = Math.floor(mo / 12);
      return y + " year" + (y !== 1 ? "s" : "") + " ago";
    } catch(e) { return ""; }
  }

  function buildPanel(id, opts) {
    if (panels[id]) panels[id].el.remove();
    injectStyles();

    const el = document.createElement('div');
    el.className = 'rova-sc-panel';
    el.style.width  = (opts.width  || 320) + 'px';
    el.style.height = (opts.height || 440) + 'px';

    const listEl = document.createElement('div');
    listEl.className = 'rova-sc-list';

    const emptyEl = document.createElement('div');
    emptyEl.className = 'rova-sc-empty';
    emptyEl.textContent = 'No comments yet';
    listEl.appendChild(emptyEl);

    el.appendChild(listEl);

    const loadingEl = document.createElement('div');
    loadingEl.className = 'rova-sc-loading';
    loadingEl.innerHTML = '<div class="rova-sc-spinner"></div><div class="rova-sc-loading-text">Loading...</div>';
    el.appendChild(loadingEl);

    getOverlay().appendChild(el);

    panels[id] = {
      el, listEl, loadingEl, emptyEl,
      comments: [],
      _clickQueue: 0,
      _boolClickQueue: 0,
      _tsClickQueue: 0,
      _boolTsClickQueue: 0,
      _replyClickQueue: 0,
      _boolReplyClickQueue: 0,
      clickedIndex: 0
    };

    return panels[id];
  }

  function renderPanel(id) {
    const p = panels[id];
    if (!p) return;
    p.listEl.innerHTML = '';
    p.listEl.appendChild(p.emptyEl);

    if (!p.comments.length) {
      p.emptyEl.classList.add('visible');
      return;
    }
    p.emptyEl.classList.remove('visible');

    p.comments.forEach((c, idx) => {
      const item = document.createElement('div');
      item.className = 'rova-sc-item';

      // Avatar
      if (c.authorPfp) {
        const img = document.createElement('img');
        img.className = 'rova-sc-avatar';
        img.src = c.authorPfp;
        img.alt = '';
        item.appendChild(img);
      } else {
        const ph = document.createElement('div');
        ph.className = 'rova-sc-avatar-ph';
        ph.textContent = (c.author || '?')[0].toUpperCase();
        item.appendChild(ph);
      }

      // Body
      const body = document.createElement('div');
      body.className = 'rova-sc-body';

      // Meta line: "KAE at 3:20 · 5 months ago"
      const meta = document.createElement('div');
      meta.className = 'rova-sc-meta';

      const author = document.createElement('span');
      author.className = 'rova-sc-author';
      author.textContent = c.author || 'Anonymous';
      meta.appendChild(author);

      const ts = formatTimestamp(c.timestamp);
      if (ts !== null) {
        const atSpan = document.createElement('span');
        atSpan.className = 'rova-sc-at';
        atSpan.textContent = ' at ';
        meta.appendChild(atSpan);

        const tsSpan = document.createElement('span');
        tsSpan.className = 'rova-sc-timestamp';
        tsSpan.textContent = ts;
        tsSpan.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          p.clickedIndex = idx + 1;
          p._tsClickQueue++;
          p._boolTsClickQueue++;
          Scratch.vm.runtime.startHats('rovasccomments_whenTimestampClicked');
        });
        meta.appendChild(tsSpan);
      }

      const relTime = formatRelativeTime(c.createdAt);
      if (relTime) {
        const dot = document.createElement('span');
        dot.className = 'rova-sc-dot';
        dot.textContent = ' · ';
        meta.appendChild(dot);

        const timeSpan = document.createElement('span');
        timeSpan.className = 'rova-sc-time';
        timeSpan.textContent = relTime;
        meta.appendChild(timeSpan);
      }

      body.appendChild(meta);

      // Text
      const text = document.createElement('div');
      text.className = 'rova-sc-text';
      text.textContent = c.body || c.text || '';
      body.appendChild(text);

      // Reply button
      const replyBtn = document.createElement('button');
      replyBtn.className = 'rova-sc-reply-btn';
      replyBtn.textContent = 'Reply';
      replyBtn.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        p.clickedIndex = idx + 1;
        p._replyClickQueue++;
        p._boolReplyClickQueue++;
        Scratch.vm.runtime.startHats('rovasccomments_whenReplyClicked');
      });
      body.appendChild(replyBtn);

      item.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        p.clickedIndex = idx + 1;
        p._clickQueue++;
        p._boolClickQueue++;
        Scratch.vm.runtime.startHats('rovasccomments_whenCommentClicked');
      });

      item.appendChild(body);
      p.listEl.appendChild(item);
    });
  }

  class RovaSCComments {
    getInfo() {
      return {
        id: 'rovasccomments',
        name: 'SC Comments',
        color1: '#ff5500',
        color2: '#cc4400',
        blocks: [

          // ── Create ─────────────────────────────────────────────────────
          {
            opcode: 'createPanel',
            blockType: BlockType.COMMAND,
            text: 'create SC comments panel [ID] width [W] height [H]',
            arguments: {
              ID: { type: ArgumentType.STRING, defaultValue: 'sc1' },
              W:  { type: ArgumentType.NUMBER, defaultValue: 320 },
              H:  { type: ArgumentType.NUMBER, defaultValue: 440 },
            }
          },
          {
            opcode: 'deletePanel',
            blockType: BlockType.COMMAND,
            text: 'delete SC comments panel [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'showPanel',
            blockType: BlockType.COMMAND,
            text: 'show SC comments panel [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'hidePanel',
            blockType: BlockType.COMMAND,
            text: 'hide SC comments panel [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'setPanelPosition',
            blockType: BlockType.COMMAND,
            text: 'set SC comments panel [ID] position x [X] y [Y]',
            arguments: {
              ID: { type: ArgumentType.STRING, defaultValue: 'sc1' },
              X:  { type: ArgumentType.NUMBER, defaultValue: 0 },
              Y:  { type: ArgumentType.NUMBER, defaultValue: 0 },
            }
          },
          {
            opcode: 'setPanelCSS',
            blockType: BlockType.COMMAND,
            text: 'set SC comments panel [ID] CSS [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'sc1' },
              CSS: { type: ArgumentType.STRING, defaultValue: '' },
            }
          },
          '---',

          // ── Comments ───────────────────────────────────────────────────
          {
            opcode: 'setCommentsJSON',
            blockType: BlockType.COMMAND,
            text: 'set SC comments in panel [ID] from JSON [JSON]',
            arguments: {
              ID:   { type: ArgumentType.STRING, defaultValue: 'sc1' },
              JSON: { type: ArgumentType.STRING, defaultValue: '[]' },
            }
          },
          {
            opcode: 'addComment',
            blockType: BlockType.COMMAND,
            text: 'add SC comment to panel [ID] author [AUTHOR] pfp [PFP] text [TEXT] timestamp [TS] date [DATE]',
            arguments: {
              ID:     { type: ArgumentType.STRING, defaultValue: 'sc1' },
              AUTHOR: { type: ArgumentType.STRING, defaultValue: 'KAE' },
              PFP:    { type: ArgumentType.STRING, defaultValue: '' },
              TEXT:   { type: ArgumentType.STRING, defaultValue: 'Yes thats the Take Down!!!!' },
              TS:     { type: ArgumentType.NUMBER, defaultValue: 200 },
              DATE:   { type: ArgumentType.STRING, defaultValue: '' },
            }
          },
          {
            opcode: 'clearComments',
            blockType: BlockType.COMMAND,
            text: 'clear SC comments in panel [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'renderComments',
            blockType: BlockType.COMMAND,
            text: 'render SC comments in panel [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          '---',

          // ── Loading ────────────────────────────────────────────────────
          {
            opcode: 'showLoading',
            blockType: BlockType.COMMAND,
            text: 'show loading in SC panel [ID] message [MSG]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'sc1' },
              MSG: { type: ArgumentType.STRING, defaultValue: 'Loading comments...' },
            }
          },
          {
            opcode: 'hideLoading',
            blockType: BlockType.COMMAND,
            text: 'hide loading in SC panel [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          '---',

          // ── Events ─────────────────────────────────────────────────────
          {
            opcode: 'whenCommentClicked',
            blockType: BlockType.HAT,
            text: 'when SC comment clicked in panel [ID]',
            isEdgeActivated: false,
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'commentWasClicked',
            blockType: BlockType.BOOLEAN,
            text: 'SC comment was clicked in panel [ID]?',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'whenTimestampClicked',
            blockType: BlockType.HAT,
            text: 'when timestamp clicked in SC panel [ID]',
            isEdgeActivated: false,
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'timestampWasClicked',
            blockType: BlockType.BOOLEAN,
            text: 'timestamp was clicked in SC panel [ID]?',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'whenReplyClicked',
            blockType: BlockType.HAT,
            text: 'when Reply clicked in SC panel [ID]',
            isEdgeActivated: false,
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'replyWasClicked',
            blockType: BlockType.BOOLEAN,
            text: 'Reply was clicked in SC panel [ID]?',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          '---',

          // ── Info ───────────────────────────────────────────────────────
          {
            opcode: 'clickedIndex',
            blockType: BlockType.REPORTER,
            text: 'clicked SC comment index in panel [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          {
            opcode: 'clickedField',
            blockType: BlockType.REPORTER,
            text: '[FIELD] of clicked SC comment in panel [ID]',
            arguments: {
              FIELD: { type: ArgumentType.STRING, menu: 'fieldMenu' },
              ID:    { type: ArgumentType.STRING, defaultValue: 'sc1' }
            }
          },
          {
            opcode: 'commentCount',
            blockType: BlockType.REPORTER,
            text: 'number of SC comments in panel [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'sc1' } }
          },
          '---',

          // ── CSS ────────────────────────────────────────────────────────
          {
            opcode: 'injectCSS',
            blockType: BlockType.COMMAND,
            text: 'inject SC global CSS [CSS]',
            arguments: { CSS: { type: ArgumentType.STRING, defaultValue: '.rova-sc-panel { }' } }
          }
        ],
        menus: {
          fieldMenu: {
            acceptReporters: true,
            items: [
              { text: 'text',         value: 'body'       },
              { text: 'author',       value: 'author'     },
              { text: 'author pfp',   value: 'authorPfp'  },
              { text: 'author ID',    value: 'authorId'   },
              { text: 'timestamp',    value: 'timestamp'  },
              { text: 'created at',   value: 'createdAt'  },
              { text: 'permalink',    value: 'permalink'  }
            ]
          }
        }
      };
    }

    createPanel({ ID, W, H }) {
      buildPanel(Cast.toString(ID), { width: Cast.toNumber(W), height: Cast.toNumber(H) });
    }

    deletePanel({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p) { p.el.remove(); delete panels[Cast.toString(ID)]; }
    }

    showPanel({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p) p.el.style.display = 'flex';
    }

    hidePanel({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p) p.el.style.display = 'none';
    }

    setPanelPosition({ ID, X, Y }) {
      const p  = panels[Cast.toString(ID)];
      if (!p) return;
      const sw = Scratch.vm.runtime.stageWidth;
      const sh = Scratch.vm.runtime.stageHeight;
      const h  = parseFloat(p.el.style.height) || 440;
      p.el.style.left = (sw / 2 + Cast.toNumber(X)) + 'px';
      p.el.style.top  = (sh / 2 - Cast.toNumber(Y) - h) + 'px';
    }

    setPanelCSS({ ID, CSS }) {
      const p = panels[Cast.toString(ID)];
      if (p) p.el.style.cssText += ';' + Cast.toString(CSS);
    }

    setCommentsJSON({ ID, JSON: jsonStr }) {
      const p = panels[Cast.toString(ID)];
      if (!p) return;
      try {
        const arr = JSON.parse(Cast.toString(jsonStr));
        if (Array.isArray(arr)) p.comments = arr;
      } catch(e) {}
    }

    addComment({ ID, AUTHOR, PFP, TEXT, TS, DATE }) {
      const p = panels[Cast.toString(ID)];
      if (!p) return;
      p.comments.push({
        author:    Cast.toString(AUTHOR),
        authorPfp: Cast.toString(PFP),
        body:      Cast.toString(TEXT),
        timestamp: Cast.toNumber(TS),
        createdAt: Cast.toString(DATE),
        authorId:  '',
        permalink: ''
      });
    }

    clearComments({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p) p.comments = [];
    }

    renderComments({ ID }) { renderPanel(Cast.toString(ID)); }

    showLoading({ ID, MSG }) {
      const p = panels[Cast.toString(ID)];
      if (!p) return;
      const txt = p.loadingEl.querySelector('.rova-sc-loading-text');
      if (txt) txt.textContent = Cast.toString(MSG);
      p.loadingEl.classList.add('visible');
    }

    hideLoading({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p) p.loadingEl.classList.remove('visible');
    }

    whenCommentClicked({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p && p._clickQueue > 0) { p._clickQueue--; return true; }
      return false;
    }

    commentWasClicked({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p && p._boolClickQueue > 0) { p._boolClickQueue--; return true; }
      return false;
    }

    whenTimestampClicked({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p && p._tsClickQueue > 0) { p._tsClickQueue--; return true; }
      return false;
    }

    timestampWasClicked({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p && p._boolTsClickQueue > 0) { p._boolTsClickQueue--; return true; }
      return false;
    }

    whenReplyClicked({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p && p._replyClickQueue > 0) { p._replyClickQueue--; return true; }
      return false;
    }

    replyWasClicked({ ID }) {
      const p = panels[Cast.toString(ID)];
      if (p && p._boolReplyClickQueue > 0) { p._boolReplyClickQueue--; return true; }
      return false;
    }

    clickedIndex({ ID }) {
      const p = panels[Cast.toString(ID)];
      return p ? p.clickedIndex : 0;
    }

    clickedField({ FIELD, ID }) {
      const p = panels[Cast.toString(ID)];
      if (!p || !p.clickedIndex) return '';
      const c = p.comments[p.clickedIndex - 1];
      return c ? String(c[Cast.toString(FIELD)] ?? '') : '';
    }

    commentCount({ ID }) {
      const p = panels[Cast.toString(ID)];
      return p ? p.comments.length : 0;
    }

    injectCSS({ CSS }) {
      const style = document.createElement('style');
      style.textContent = Cast.toString(CSS);
      document.head.appendChild(style);
    }
  }

  Scratch.extensions.register(new RovaSCComments());
})(Scratch);
