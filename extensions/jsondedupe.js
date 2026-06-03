// Name: JSON Dedupe
// ID: jsondedupe
// Description: Removes duplicate values from a JSON array.
// By: You

(function (Scratch) {
  "use strict";

  class JSONDedupe {
    getInfo() {
      return {
        id: "jsondedupe",
        name: "JSON Dedupe",
        color1: "#4C97FF",
        color2: "#3373CC",
        blocks: [
          {
            opcode: "removeDuplicates",
            blockType: Scratch.BlockType.REPORTER,
            text: "remove duplicates from [ARRAY]",
            arguments: {
              ARRAY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "[3,4,4,5]",
              },
            },
          },
        ],
      };
    }

    removeDuplicates(args) {
      let arr;
      try {
        arr = JSON.parse(args.ARRAY);
      } catch (e) {
        return args.ARRAY; // not valid JSON, return as-is
      }

      if (!Array.isArray(arr)) {
        return args.ARRAY; // only operate on arrays
      }

      const seen = new Set();
      const result = [];
      for (const item of arr) {
        // Use JSON.stringify so we can dedupe objects/arrays too,
        // not just primitives.
        const key = typeof item === "object" && item !== null
          ? JSON.stringify(item)
          : typeof item + ":" + String(item);
        if (!seen.has(key)) {
          seen.add(key);
          result.push(item);
        }
      }

      return JSON.stringify(result);
    }
  }

  Scratch.extensions.register(new JSONDedupe());
})(Scratch);
