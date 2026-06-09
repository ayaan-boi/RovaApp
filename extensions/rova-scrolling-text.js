// Rova Scroll Text Extension
// Scrolling marquee text elements on the stage

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Rova Scroll Text requires unsandboxed mode.");
  }

  const { BlockType, ArgumentType, Cast } = Scratch;

  const texts = {}; // id -> { el, wrapper, inner, clone, scrolling, speed }

  function injectStyles() {
    if (document.getElementById('rova-scrolltext-styles')) return;
    const style = document.createElement('style');
    style.id = 'rova-scrolltext-styles';
    style.textContent = `
      .rova-scrolltext-wrap {
        position: absolute;
        overflow: hidden;
        pointer-events: none;
        white-space: nowrap;
      }
      .rova-scrolltext-track {
        display: inline-flex;
        white-space: nowrap;
        will-change: transform;
      }
      .rova-scrolltext-track.scrolling {
        animation: rova-scrolltext-move var(--rova-scroll-dur, 8s) linear infinite;
      }
      .rova-scrolltext-part {
        display: inline-block;
        white-space: nowrap;
        padding-right: 48px;
      }
      @keyframes rova-scrolltext-move {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
  }

  function getOverlay() {
    let overlay = document.querySelector('.LordCatInterfaces');
    if (!overlay) {
      overlay = document.getElementById('rova-scrolltext-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'rova-scrolltext-overlay';
        overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
        try { Scratch.vm.renderer.addOverlay(overlay, 'scale'); }
        catch(e) { document.body.appendChild(overlay); }
      }
    }
    return overlay;
  }

  function createEl(id, text, opts) {
    if (texts[id]) texts[id].wrap.remove();

    injectStyles();

    const wrap = document.createElement('div');
    wrap.className = 'rova-scrolltext-wrap';
    wrap.style.width    = (opts.width  || 200) + 'px';
    wrap.style.height   = (opts.height || 30)  + 'px';

    const track = document.createElement('div');
    track.className = 'rova-scrolltext-track';

    const part1 = document.createElement('span');
    part1.className = 'rova-scrolltext-part';
    part1.textContent = text;

    track.appendChild(part1);
    wrap.appendChild(track);
    getOverlay().appendChild(wrap);

    const entry = { wrap, track, part1, clone: null, scrolling: false };
    texts[id] = entry;

    // After paint — measure and start if needed
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const textW = part1.offsetWidth + 48;
      const wrapW = wrap.offsetWidth;
      if (textW > wrapW + 4) {
        const part2 = document.createElement('span');
        part2.className = 'rova-scrolltext-part';
        part2.textContent = text;
        // Copy any inline styles already applied to part1
        part2.style.cssText = part1.style.cssText;
        track.appendChild(part2);
        entry.clone = part2;
        const dur = Math.max(3, textW / (opts.speed || 40));
        track.style.setProperty('--rova-scroll-dur', dur + 's');
        track.classList.add('scrolling');
        entry.scrolling = true;
      }
    }));

    return entry;
  }

  function applyPosition(id) {
    const e = texts[id];
    if (!e) return;
    const sw = Scratch.vm.runtime.stageWidth;
    const sh = Scratch.vm.runtime.stageHeight;
    const x  = e._x || 0;
    const y  = e._y || 0;
    const h  = parseFloat(e.wrap.style.height) || 30;
    e.wrap.style.left = (sw / 2 + x) + 'px';
    e.wrap.style.top  = (sh / 2 - y - h) + 'px';
  }

  class RovaScrollText {
    getInfo() {
      return {
        id: 'rovascrolltext',
        name: 'Scroll Text',
        color1: '#2e7d32',
        color2: '#1b5e20',
        blocks: [
          {
            opcode: 'create',
            blockType: BlockType.COMMAND,
            text: 'create scroll text [ID] text [TEXT] width [W] height [H]',
            arguments: {
              ID:   { type: ArgumentType.STRING, defaultValue: 'text1' },
              TEXT: { type: ArgumentType.STRING, defaultValue: 'STUCK WITH ME - A Mario\'s Madness Song' },
              W:    { type: ArgumentType.NUMBER, defaultValue: 200 },
              H:    { type: ArgumentType.NUMBER, defaultValue: 20 },
            }
          },
          {
            opcode: 'createWithSpeed',
            blockType: BlockType.COMMAND,
            text: 'create scroll text [ID] text [TEXT] width [W] height [H] speed [SPEED] px/s',
            arguments: {
              ID:    { type: ArgumentType.STRING, defaultValue: 'text1' },
              TEXT:  { type: ArgumentType.STRING, defaultValue: 'STUCK WITH ME - A Mario\'s Madness Song' },
              W:     { type: ArgumentType.NUMBER, defaultValue: 200 },
              H:     { type: ArgumentType.NUMBER, defaultValue: 20 },
              SPEED: { type: ArgumentType.NUMBER, defaultValue: 40 },
            }
          },
          {
            opcode: 'setText',
            blockType: BlockType.COMMAND,
            text: 'set scroll text [ID] to [TEXT]',
            arguments: {
              ID:   { type: ArgumentType.STRING, defaultValue: 'text1' },
              TEXT: { type: ArgumentType.STRING, defaultValue: 'New text here' },
            }
          },
          {
            opcode: 'setPosition',
            blockType: BlockType.COMMAND,
            text: 'set scroll text [ID] position x [X] y [Y]',
            arguments: {
              ID: { type: ArgumentType.STRING, defaultValue: 'text1' },
              X:  { type: ArgumentType.NUMBER, defaultValue: 0 },
              Y:  { type: ArgumentType.NUMBER, defaultValue: 0 },
            }
          },
          {
            opcode: 'setCSS',
            blockType: BlockType.COMMAND,
            text: 'set scroll text [ID] CSS [CSS]',
            arguments: {
              ID:  { type: ArgumentType.STRING, defaultValue: 'text1' },
              CSS: { type: ArgumentType.STRING, defaultValue: 'color: white; font-size: 13px' },
            }
          },
          {
            opcode: 'setSpeed',
            blockType: BlockType.COMMAND,
            text: 'set scroll text [ID] speed to [SPEED] px/s',
            arguments: {
              ID:    { type: ArgumentType.STRING, defaultValue: 'text1' },
              SPEED: { type: ArgumentType.NUMBER, defaultValue: 40 },
            }
          },
          {
            opcode: 'pause',
            blockType: BlockType.COMMAND,
            text: 'pause scroll text [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'text1' } }
          },
          {
            opcode: 'resume',
            blockType: BlockType.COMMAND,
            text: 'resume scroll text [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'text1' } }
          },
          {
            opcode: 'show',
            blockType: BlockType.COMMAND,
            text: 'show scroll text [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'text1' } }
          },
          {
            opcode: 'hide',
            blockType: BlockType.COMMAND,
            text: 'hide scroll text [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'text1' } }
          },
          {
            opcode: 'remove',
            blockType: BlockType.COMMAND,
            text: 'remove scroll text [ID]',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'text1' } }
          },
          '---',
          {
            opcode: 'isScrolling',
            blockType: BlockType.BOOLEAN,
            text: 'scroll text [ID] is scrolling?',
            arguments: { ID: { type: ArgumentType.STRING, defaultValue: 'text1' } }
          },
          '---',
          {
            opcode: 'setFade',
            blockType: BlockType.COMMAND,
            text: 'set scroll text [ID] fade [ON]',
            arguments: {
              ID: { type: ArgumentType.STRING, defaultValue: 'text1' },
              ON: { type: ArgumentType.STRING, menu: 'onOffMenu' },
            }
          },
        ],
        menus: {
          onOffMenu: { acceptReporters: false, items: ['on', 'off'] }
        }
      };
    }

create({ ID, TEXT, W, H }) {
  const id = Cast.toString(ID);
  const e  = createEl(id, Cast.toString(TEXT), {
    width: Cast.toNumber(W),
    height: Cast.toNumber(H),
    speed: 40
  });
  e._x = 0; e._y = 0;
  applyPosition(id);   // ← ADD THIS LINE
}

createWithSpeed({ ID, TEXT, W, H, SPEED }) {
  const id = Cast.toString(ID);
  const e  = createEl(id, Cast.toString(TEXT), {
    width: Cast.toNumber(W),
    height: Cast.toNumber(H),
    speed: Cast.toNumber(SPEED)
  });
  e._x = 0; e._y = 0;
  applyPosition(id);   // ← ADD THIS LINE
}

    setText({ ID, TEXT }) {
      const id = Cast.toString(ID);
      const e  = texts[id];
      if (!e) return;
      // Rebuild with same dimensions and speed
      const w = parseFloat(e.wrap.style.width)  || 200;
      const h = parseFloat(e.wrap.style.height) || 20;
      const x = e._x || 0;
      const y = e._y || 0;
      const css = e._css || '';
      const speed = e._speed || 40;
      const newE = createEl(id, Cast.toString(TEXT), { width: w, height: h, speed });
      newE._x = x; newE._y = y; newE._css = css; newE._speed = speed;
      if (css) { newE.part1.style.cssText = css; if (newE.clone) newE.clone.style.cssText = css; }
      applyPosition(id);
    }

    setPosition({ ID, X, Y }) {
      const id = Cast.toString(ID);
      const e  = texts[id];
      if (!e) return;
      e._x = Cast.toNumber(X);
      e._y = Cast.toNumber(Y);
      applyPosition(id);
    }

    setCSS({ ID, CSS }) {
      const id  = Cast.toString(ID);
      const e   = texts[id];
      if (!e) return;
      const css = Cast.toString(CSS);
      e._css = css;
      e.part1.style.cssText = css;
      if (e.clone) {
        e.clone.style.cssText = css;
      } else {
        // Clone may not exist yet — watch for it
        const observer = new MutationObserver(() => {
          if (e.clone) { e.clone.style.cssText = css; observer.disconnect(); }
        });
        observer.observe(e.track, { childList: true });
        // Also apply after next frame in case clone is added in rAF
        requestAnimationFrame(() => { if (e.clone) e.clone.style.cssText = css; });
      }
    }

    setSpeed({ ID, SPEED }) {
      const id = Cast.toString(ID);
      const e  = texts[id];
      if (!e) return;
      const speed = Math.max(1, Cast.toNumber(SPEED));
      e._speed = speed;
      if (e.scrolling) {
        const textW = e.part1.offsetWidth + 48;
        const dur   = Math.max(3, textW / speed);
        e.track.style.setProperty('--rova-scroll-dur', dur + 's');
      }
    }

    pause({ ID }) {
      const e = texts[Cast.toString(ID)];
      if (e) e.track.style.animationPlayState = 'paused';
    }

    resume({ ID }) {
      const e = texts[Cast.toString(ID)];
      if (e) e.track.style.animationPlayState = 'running';
    }

    show({ ID }) {
      const e = texts[Cast.toString(ID)];
      if (e) e.wrap.style.display = 'block';
    }

    hide({ ID }) {
      const e = texts[Cast.toString(ID)];
      if (e) e.wrap.style.display = 'none';
    }

    remove({ ID }) {
      const id = Cast.toString(ID);
      if (texts[id]) { texts[id].wrap.remove(); delete texts[id]; }
    }

    isScrolling({ ID }) {
      const e = texts[Cast.toString(ID)];
      return !!(e && e.scrolling);
    }

    setFade({ ID, ON }) {
      const e = texts[Cast.toString(ID)];
      if (!e) return;
      if (Cast.toString(ON) === 'on') {
        e.wrap.style.webkitMaskImage = 'linear-gradient(to right, transparent 0%, black 8%, black 82%, transparent 100%)';
        e.wrap.style.maskImage       = 'linear-gradient(to right, transparent 0%, black 8%, black 82%, transparent 100%)';
      } else {
        e.wrap.style.webkitMaskImage = 'none';
        e.wrap.style.maskImage       = 'none';
      }
    }
  }

  Scratch.extensions.register(new RovaScrollText());
})(Scratch);
