const defaultTheme = require("tailwindcss/defaultTheme");

const remRegex = /(\d*\.?\d+)rem$/;

function rem2px(input, fontSize = 16) {
  if (input == null) {
    return input;
  }

  switch (typeof input) {
    case "object": {
      if (Array.isArray(input)) {
        return input.map((val) => rem2px(val, fontSize));
      }
      const ret = {};
      for (const key in input) {
        if (Object.hasOwn(input, key)) {
          ret[key] = rem2px(input[key], fontSize);
        }
      }
      return ret;
    }
    case "string":
      return input.replace(
        remRegex,
        (_, val) => `${Number.parseFloat(val) * fontSize}px`
      );
    default:
      return input;
  }
}

module.exports = {
  theme: {
    borderRadius: rem2px(defaultTheme.borderRadius),
    spacing: rem2px(defaultTheme.spacing),
    fontSize: rem2px(defaultTheme.fontSize),
    padding: rem2px(defaultTheme.padding),
    margin: rem2px(defaultTheme.margin),
    width: rem2px(defaultTheme.width),
    height: rem2px(defaultTheme.height),
    maxWidth: rem2px(defaultTheme.maxWidth),
    maxHeight: rem2px(defaultTheme.maxHeight),
    minWidth: rem2px(defaultTheme.minWidth),
  },
};
