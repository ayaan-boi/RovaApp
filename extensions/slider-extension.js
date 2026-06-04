// Name: HTML Sliders
// ID: htmlSliders
// Description: Create draggable horizontal sliders on the page and read their values.
// By: ArenaAgent
// License: MIT

(function (Scratch) {
  "use strict";

  const STYLE_ID = "pm-sliders-styles";
  const CUSTOM_STYLE_ID = "pm-sliders-custom-styles";
  const CONTAINER_ID = "pm-sliders-container";

  // Default look — overridable via custom CSS block
  const CSS = `
    #${CONTAINER_ID} {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147482000;
    }
    #${CONTAINER_ID} .pms-slider {
      position: absolute;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #fff;
      user-select: none;
      -webkit-user-select: none;
    }
    #${CONTAINER_ID} .pms-label {
      font-size: 12px;
      margin-bottom: 4px;
      opacity: 0.9;
      text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    }
    #${CONTAINER_ID} .pms-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #${CONTAINER_ID} input[type=range] {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 6px;
      background: rgba(255,255,255,0.25);
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      margin: 0;
    }
    #${CONTAINER_ID} input[type=range]::-webkit-slider-thumb {
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
    #${CONTAINER_ID} input[type=range]:active::-webkit-slider-thumb { cursor: grabbing; }
    #${CONTAINER_ID} input[type=range]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: #6b53ff;
      border: 2px solid #fff;
      border-radius: 50%;
      cursor: grab;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
    #${CONTAINER_ID} .pms-value {
      min-width: 40px;
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-size: 13px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    }
  `;

  function injectStyles() {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    if (!document.getElementById(CONTAINER_ID)) {
      const c = document.createElement("div");
      c.id = CONTAINER_ID;
      document.body.appendChild(c);
    }
  }

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

  // --- State ---------------------------------------------------------------
  // id -> { wrapperEl, inputEl, valueEl, labelEl, value, changed }
  const sliders = {};

  function createSlider(id, opts) {
    injectStyles();
    if (sliders[id]) {
      // Already exists — just update properties
      updateSlider(id, opts);
      return;
    }
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
    document.getElementById(CONTAINER_ID).appendChild(wrap);

    const inputEl = wrap.querySelector("input");
    const valueEl = wrap.querySelector(".pms-value");
    const labelEl = wrap.querySelector(".pms-label");

    const rec = {
      wrapperEl: wrap, inputEl, valueEl, labelEl,
      value: 0, changed: false,
    };
    sliders[id] = rec;

    inputEl.addEventListener("input", () => {
      rec.value = Number(inputEl.value);
      valueEl.textContent = formatValue(rec.value, inputEl.step);
      rec.changed = true;
      // Fire the hat block
      Scratch.vm.runtime.startHats("htmlSliders_whenChanged", { ID: id });
      Scratch.vm.runtime.startHats("htmlSliders_whenAnyChanged");
    });

    updateSlider(id, opts);
  }

  function updateSlider(id, opts) {
    const rec = sliders[id];
    if (!rec) return;
    const o = opts || {};
    if (o.min   != null) rec.inputEl.min   = o.min;
    if (o.max   != null) rec.inputEl.max   = o.max;
    if (o.step  != null) rec.inputEl.step  = o.step;
    if (o.value != null) {
      rec.inputEl.value = o.value;
      rec.value = Number(o.value);
    }
    if (o.label != null) {
      rec.labelEl.textContent = String(o.label);
      rec.labelEl.style.display = String(o.label) ? "" : "none";
    }
    if (o.x != null) rec.wrapperEl.style.left = o.x + "px";
    if (o.y != null) rec.wrapperEl.style.top  = o.y + "px";
    if (o.w != null) rec.wrapperEl.style.width = o.w + "px";

    rec.valueEl.textContent = formatValue(rec.value, rec.inputEl.step);
  }

  function formatValue(v, step) {
    const s = Number(step);
    if (!isFinite(s) || s >= 1) return String(Math.round(v));
    // Show enough decimals to match step
    const decimals = Math.min(4, Math.max(0, -Math.floor(Math.log10(s))));
    return Number(v).toFixed(decimals);
  }

  function removeSlider(id) {
    const rec = sliders[id];
    if (!rec) return;
    rec.wrapperEl.remove();
    delete sliders[id];
  }

  function removeAll() {
    for (const id of Object.keys(sliders)) removeSlider(id);
  }

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
              X:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 20  },
              Y:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 20  },
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
              X:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
              Y:  { type: Scratch.ArgumentType.NUMBER, defaultValue: 20 },
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
          {
            blockType: Scratch.BlockType.LABEL,
            text: "Styling",
          },
          {
            opcode: "injectCSS",
            blockType: Scratch.BlockType.COMMAND,
            text: "set custom CSS to [CSS]",
            arguments: {
              CSS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue:
                  "#pm-sliders-container input[type=range]::-webkit-slider-thumb { background: #ff4d6d; }",
              },
            },
          },
          {
            opcode: "clearCSS",
            blockType: Scratch.BlockType.COMMAND,
            text: "clear custom CSS",
          },
        ],
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
    setValue(args) {
      updateSlider(String(args.ID), { value: Number(args.V) });
    }
    setLabel(args) {
      updateSlider(String(args.ID), { label: String(args.L) });
    }
    movePos(args) {
      updateSlider(String(args.ID), { x: Number(args.X), y: Number(args.Y) });
    }
    setWidth(args) {
      updateSlider(String(args.ID), { w: Number(args.W) });
    }
    removeOne(args)     { removeSlider(String(args.ID)); }
    removeAllBlock()    { removeAll(); }

    getValue(args) {
      const r = sliders[String(args.ID)];
      return r ? r.value : 0;
    }
    exists(args) { return !!sliders[String(args.ID)]; }
    listSliders() { return JSON.stringify(Object.keys(sliders)); }

    whenChanged(args) {
      const r = sliders[String(args.ID)];
      if (r && r.changed) { r.changed = false; return true; }
      return false;
    }
    whenAnyChanged() {
      let any = false;
      for (const r of Object.values(sliders)) {
        if (r.changed) { r.changed = false; any = true; }
      }
      return any;
    }

    injectCSS(args) { customCSS = String(args.CSS || ""); applyCustomCSS(); }
    clearCSS()      { customCSS = ""; applyCustomCSS(); }
  }

  Scratch.extensions.register(new SliderExtension());
})(Scratch);
