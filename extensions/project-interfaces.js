// Name: HTML Sliders
// ID: htmlSliders
// Description: Draggable horizontal sliders that live on the PenguinMod stage.
// By: ArenaAgent
// License: MIT

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    alert("The HTML Sliders extension must run unsandboxed!");
    return;
  }

  const vm = Scratch.vm;

  const STYLE_ID = "pm-sliders-styles";
  const CUSTOM_STYLE_ID = "pm-sliders-custom-styles";

  // ------------------------------------------------------------------------
  // Overlay container — attached to the stage via vm.renderer.addOverlay,
  // which makes it scale + reposition with the project automatically.
  // ------------------------------------------------------------------------
  const overlay = document.createElement("div");
  overlay.className = "pm-sliders-overlay";
  // Note: don't set width/height — addOverlay("scale") sizes & positions this
  // for us. Setting pointer-events:none on the container lets the project
  // receive clicks in empty space, while each slider re-enables pointer
  // events on itself. High z-index keeps sliders above variable monitors
  // and other stage overlays.
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "9999";
  vm.renderer.addOverlay(overlay, "scale");

  // ------------------------------------------------------------------------
  // Default styling — note all sizes are in *stage pixels* because the
  // overlay is scaled by the renderer to match the stage.
  // ------------------------------------------------------------------------
  const CSS = `
    .pm-sliders-overlay .pms-slider {
      position: absolute;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #fff;
      user-select: none;
      -webkit-user-select: none;
      z-index: 9999;
    }
    .pm-sliders-overlay .pms-label {
      font-size: 12px;
      margin-bottom: 4px;
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0,0,0,0.7);
    }
    .pm-sliders-overlay .pms-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pm-sliders-overlay input[type=range] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      background: rgba(255,255,255,0.3);
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      margin: 0;
      accent-color: #6b53ff;
    }
    .pm-sliders-overlay input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      background: #6b53ff;
      border: 2px solid #fff;
      border-radius: 50%;
      cursor: grab;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
    .pm-sliders-overlay input[type=range]:active::-webkit-slider-thumb { cursor: grabbing; }
    .pm-sliders-overlay input[type=range]::-moz-range-thumb {
      width: 18px; height: 18px;
      background: #6b53ff;
      border: 2px solid #fff;
      border-radius: 50%;
      cursor: grab;
    }
    .pm-sliders-overlay .pms-value {
      min-width: 40px;
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-size: 13px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.7);
    }
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement("style");
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }
  injectStyles();

  let customCSS = "";
  function applyCustomCSS() {
    let tag = document.getElementById(CUSTOM_STYLE_ID);
    if (!tag) {
      tag = document.createElement("style");
      tag.id = CUSTOM_STYLE_ID;
      document.head.appendChild(tag);
    }
    tag.textContent = customCSS || "";
  }

  // ------------------------------------------------------------------------
  // State
  //   id -> { wrap, input, valueEl, labelEl, x, y, w, value, changed }
  // ------------------------------------------------------------------------
  const sliders = {};
  const lastValues = {}; // for "when changed" hat

  // Convert Scratch stage coords (0,0 = center, +y = up) -> stage pixels.
  // The overlay layer is sized to the stage in stage-pixel units, so we can
  // just use raw pixel values for left/top/width.
  function applyPosition(rec) {
    const sw = vm.runtime.stageWidth  || 480;
    const sh = vm.runtime.stageHeight || 360;
    // Position the *center* of the slider at the given stage coord
    const centerX = sw / 2 + rec.x;
    const centerY = sh / 2 - rec.y;
    rec.wrap.style.left  = (centerX - rec.w / 2) + "px";
    rec.wrap.style.top   = centerY + "px";
    rec.wrap.style.width = rec.w + "px";
    // Vertically center using a transform on top only (doesn't affect width)
    rec.wrap.style.transform = "translateY(-50%)";
  }

  function createSlider(id, opts) {
    if (sliders[id]) { updateSlider(id, opts); return; }
    const wrap = document.createElement("div");
    wrap.className = "pms-slider";
    wrap.dataset.id = id;
    wrap.innerHTML = `
      <div class="pms-label"></div>
      <div class="pms-row">
        <input type="range" />
        <div class="pms-value"></div>
      </div>
    `;
    overlay.appendChild(wrap);

    const input   = wrap.querySelector("input");
    const valueEl = wrap.querySelector(".pms-value");
    const labelEl = wrap.querySelector(".pms-label");

    const rec = {
      wrap, input, valueEl, labelEl,
      x: 0, y: 0, w: 200,
      value: 0, changed: false,
    };
    sliders[id] = rec;

    input.addEventListener("input", () => {
      rec.value = Number(input.value);
      valueEl.textContent = formatValue(rec.value, input.step);
      rec.changed = true;
      try {
        vm.runtime.startHats("htmlSliders_whenChanged",   { ID: id });
        vm.runtime.startHats("htmlSliders_whenAnyChanged");
      } catch (_) {}
    });

    updateSlider(id, opts);
  }

  function updateSlider(id, opts) {
    const rec = sliders[id];
    if (!rec) return;
    const o = opts || {};
    if (o.min   != null) rec.input.min   = o.min;
    if (o.max   != null) rec.input.max   = o.max;
    if (o.step  != null) rec.input.step  = o.step;
    if (o.value != null) { rec.input.value = o.value; rec.value = Number(o.value); }
    if (o.label != null) {
      rec.labelEl.textContent = String(o.label);
      rec.labelEl.style.display = String(o.label) ? "" : "none";
    }
    if (o.x != null) rec.x = Number(o.x);
    if (o.y != null) rec.y = Number(o.y);
    if (o.w != null) rec.w = Number(o.w);

    rec.valueEl.textContent = formatValue(rec.value, rec.input.step);
    applyPosition(rec);
  }

  function formatValue(v, step) {
    const s = Number(step);
    if (!isFinite(s) || s >= 1) return String(Math.round(v));
    const decimals = Math.min(4, Math.max(0, -Math.floor(Math.log10(s))));
    return Number(v).toFixed(decimals);
  }

  function removeSlider(id) {
    const rec = sliders[id];
    if (!rec) return;
    rec.wrap.remove();
    delete sliders[id];
  }

  function removeAll() {
    for (const id of Object.keys(sliders)) removeSlider(id);
  }

  // Re-apply positions whenever the stage size changes
  vm.runtime.on?.("STAGE_SIZE_CHANGED", () => {
    for (const rec of Object.values(sliders)) applyPosition(rec);
  });

  // ------------------------------------------------------------------------
  class SliderExtension {
    getInfo() {
      return {
        id: "htmlSliders",
        name: "HTML Sliders",
        color1: "#6b53ff",
        color2: "#5641e8",
        blocks: [
          {
            opcode: "createSlider",
            blockType: Scratch.BlockType.COMMAND,
            text: "create slider [ID] at x:[X] y:[Y] width:[W]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
              X:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 0   },
              Y:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 0   },
              W:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 200 },
            },
          },
          {
            opcode: "configRange",
            blockType: Scratch.BlockType.COMMAND,
            text: "set slider [ID] min:[MIN] max:[MAX] step:[STEP]",
            arguments: {
              ID:   { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
              MIN:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 0   },
              MAX:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 100 },
              STEP: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1   },
            },
          },
          {
            opcode: "setValue",
            blockType: Scratch.BlockType.COMMAND,
            text: "set slider [ID] value to [V]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
              V:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 50 },
            },
          },
          {
            opcode: "setLabel",
            blockType: Scratch.BlockType.COMMAND,
            text: "set slider [ID] label to [L]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
              L:  { type: Scratch.ArgumentType.STRING, defaultValue: "Volume" },
            },
          },
          {
            opcode: "movePos",
            blockType: Scratch.BlockType.COMMAND,
            text: "move slider [ID] to x:[X] y:[Y]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
              X:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
            },
          },
          {
            opcode: "setWidth",
            blockType: Scratch.BlockType.COMMAND,
            text: "set slider [ID] width to [W]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
              W:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 200 },
            },
          },
          "---",
          {
            opcode: "showHide",
            blockType: Scratch.BlockType.COMMAND,
            text: "[ACT] slider [ID]",
            arguments: {
              ACT: { type: Scratch.ArgumentType.STRING, menu: "showHideMenu", defaultValue: "show" },
              ID:  { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
            },
          },
          {
            opcode: "removeOne",
            blockType: Scratch.BlockType.COMMAND,
            text: "remove slider [ID]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
            },
          },
          {
            opcode: "removeAllBlock",
            blockType: Scratch.BlockType.COMMAND,
            text: "remove all sliders",
          },
          "---",
          {
            opcode: "getValue",
            blockType: Scratch.BlockType.REPORTER,
            text: "value of slider [ID]",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
            },
          },
          {
            opcode: "exists",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "slider [ID] exists?",
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
            },
          },
          {
            opcode: "listSliders",
            blockType: Scratch.BlockType.REPORTER,
            text: "all slider IDs",
          },
          "---",
          {
            opcode: "whenChanged",
            blockType: Scratch.BlockType.HAT,
            text: "when slider [ID] changed",
            isEdgeActivated: false,
            arguments: {
              ID: { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
            },
          },
          {
            opcode: "whenAnyChanged",
            blockType: Scratch.BlockType.HAT,
            text: "when any slider changed",
            isEdgeActivated: false,
          },
          "---",
          { blockType: Scratch.BlockType.LABEL, text: "Styling" },
          {
            opcode: "setSliderCSS",
            blockType: Scratch.BlockType.COMMAND,
            text: "set custom CSS for slider [ID] to [CSS]",
            arguments: {
              ID:  { type: Scratch.ArgumentType.STRING, defaultValue: "volume" },
              CSS: { type: Scratch.ArgumentType.STRING,
                     defaultValue: "accent-color: #ff4d6d" },
            },
          },
          {
            opcode: "injectCSS",
            blockType: Scratch.BlockType.COMMAND,
            text: "set global custom CSS to [CSS]",
            arguments: {
              CSS: { type: Scratch.ArgumentType.STRING,
                     defaultValue:
                       ".pm-sliders-overlay input[type=range]::-webkit-slider-thumb { background: #ff4d6d; }" },
            },
          },
          {
            opcode: "clearCSS",
            blockType: Scratch.BlockType.COMMAND,
            text: "clear global custom CSS",
          },
        ],
        menus: {
          showHideMenu: {
            acceptReporters: false,
            items: ["show", "hide"],
          },
        },
      };
    }

    createSlider(args) {
      createSlider(String(args.ID), {
        x: Number(args.X), y: Number(args.Y), w: Number(args.W),
      });
    }
    configRange(args) {
      updateSlider(String(args.ID), {
        min: Number(args.MIN), max: Number(args.MAX), step: Number(args.STEP),
      });
    }
    setValue(args)  { updateSlider(String(args.ID), { value: Number(args.V) }); }
    setLabel(args)  { updateSlider(String(args.ID), { label: String(args.L) }); }
    movePos(args)   { updateSlider(String(args.ID), { x: Number(args.X), y: Number(args.Y) }); }
    setWidth(args)  { updateSlider(String(args.ID), { w: Number(args.W) }); }

    showHide(args) {
      const r = sliders[String(args.ID)];
      if (!r) return;
      r.wrap.style.display = String(args.ACT) === "hide" ? "none" : "";
    }
    removeOne(args)  { removeSlider(String(args.ID)); }
    removeAllBlock() { removeAll(); }

    getValue(args) {
      const r = sliders[String(args.ID)];
      return r ? r.value : 0;
    }
    exists(args)   { return !!sliders[String(args.ID)]; }
    listSliders()  { return JSON.stringify(Object.keys(sliders)); }

    whenChanged(args, util) {
      // Edge-triggered: fire once per actual change
      const id = String(args.ID);
      const r = sliders[id];
      if (!r) return false;
      const blockId = util.thread.peekStack();
      const v = String(r.value);
      if (lastValues[blockId] !== v) {
        lastValues[blockId] = v;
        return true;
      }
      return false;
    }
    whenAnyChanged(args, util) {
      const blockId = util.thread.peekStack();
      const snapshot = Object.entries(sliders).map(([k, r]) => k + ":" + r.value).join("|");
      if (lastValues[blockId] !== snapshot) {
        lastValues[blockId] = snapshot;
        return true;
      }
      return false;
    }

    // Styling
    setSliderCSS(args) {
      const id = String(args.ID);
      if (!sliders[id]) return;
      const styleId = `pm-sliders-style-${id}`;
      let tag = document.getElementById(styleId);
      if (!tag) {
        tag = document.createElement("style");
        tag.id = styleId;
        document.head.appendChild(tag);
      }
      const lines = String(args.CSS || "").split(";")
        .map(s => s.trim()).filter(Boolean)
        .map(s => s + " !important").join(";\n");
      tag.textContent =
        `.pm-sliders-overlay .pms-slider[data-id="${id}"] {\n${lines}\n}`;
    }
    injectCSS(args) { customCSS = String(args.CSS || ""); applyCustomCSS(); }
    clearCSS()      { customCSS = ""; applyCustomCSS(); }
  }

  Scratch.extensions.register(new SliderExtension());
})(Scratch);
