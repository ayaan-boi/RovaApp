// Rova Number Format Extension
// Abbreviates large numbers into K, M, B etc.

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Rova Format requires unsandboxed mode.");
  }

  const { BlockType, ArgumentType, Cast } = Scratch;

  function format(n, decimals) {
    const num = Math.abs(Cast.toNumber(n));
    const sign = Cast.toNumber(n) < 0 ? "-" : "";
    const d = Math.max(0, Math.min(3, Math.round(Cast.toNumber(decimals))));

    function trim(val) {
      return parseFloat(val.toFixed(d)).toString();
    }

    if (num >= 1e12) return sign + trim(num / 1e12) + "T";
    if (num >= 1e9)  return sign + trim(num / 1e9)  + "B";
    if (num >= 1e6)  return sign + trim(num / 1e6)  + "M";
    if (num >= 1e4)  return sign + trim(num / 1e3)  + "K";
    return sign + trim(num);
  }

  class RovaFormat {
    getInfo() {
      return {
        id: "rovaformat",
        name: "Number Format",
        color1: "#5c6bc0",
        color2: "#3949ab",
        blocks: [
          {
            opcode: "abbreviate",
            blockType: BlockType.REPORTER,
            text: "abbreviate [NUM]",
            arguments: {
              NUM: { type: ArgumentType.NUMBER, defaultValue: 12500 }
            }
          },
          {
            opcode: "abbreviateDecimals",
            blockType: BlockType.REPORTER,
            text: "abbreviate [NUM] with [DEC] decimal places",
            arguments: {
              NUM: { type: ArgumentType.NUMBER, defaultValue: 12500 },
              DEC: { type: ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          "---",
          {
            opcode: "addCommas",
            blockType: BlockType.REPORTER,
            text: "add commas to [NUM]",
            arguments: {
              NUM: { type: ArgumentType.NUMBER, defaultValue: 1234567 }
            }
          },
          {
            opcode: "isAbbreviated",
            blockType: BlockType.BOOLEAN,
            text: "is [NUM] abbreviated? (>= 10000)",
            arguments: {
              NUM: { type: ArgumentType.NUMBER, defaultValue: 12500 }
            }
          }
        ]
      };
    }

    abbreviate({ NUM }) {
      return format(NUM, 0);
    }

    abbreviateDecimals({ NUM, DEC }) {
      return format(NUM, DEC);
    }

    addCommas({ NUM }) {
      return Cast.toNumber(NUM).toLocaleString("en-US");
    }

    isAbbreviated({ NUM }) {
      return Math.abs(Cast.toNumber(NUM)) >= 10000;
    }
  }

  Scratch.extensions.register(new RovaFormat());
})(Scratch);
