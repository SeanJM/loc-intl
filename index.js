function normalizePath(path) {
  return [].concat(path).join(".").split(".");
}

function get(obj, path) {
  let p = obj;
  let s = normalizePath(path);

  for (var i = 0, n = s.length - 1; i < n; i++) {
    if (p && typeof p[s[i]] !== "undefined") {
      p = p[s[i]];
    } else {
      return undefined;
    }
  }

  return p[s.slice(-1)[0]];
}

function replaceTokens(tokens) {
  return function (match, token) {
    return !/^[0-9]+\.[0-9]+$/.test(token)
      ? tokens[Number(token)]
      : match;
  };
}

/**
 * @param {object} props
 * @param {object} props.defs Language definitions
 * @param {object} props.filter Language filters
*/

function Language(props) {
  this.defs = {};
  this.filter = {};
  this.onloadSubscribers = [];
  this.load(props);
}

Language.prototype.onLoad = function (callback) {
  if (this.onloadSubscribers.indexOf(callback) === -1) {
    this.onloadSubscribers.push(callback);
  }
  return this;
};

Language.prototype.offLoad = function (callback) {
  let index = this.onloadSubscribers.indexOf(callback);
  if (index > -1) {
    this.onloadSubscribers.splice(index, 1);
  }
  return this;
};

Language.prototype.load = function (props) {
  let i = -1;
  let n = this.onloadSubscribers.length;

  if (props && props.defs) {
    Object.assign(this.defs, props.defs);
  }

  if (props && props.filters) {
    for (var method in props.filters) {
      this.filter[method] = props.filters[method].bind(this);
    }

    if (props.filters.constructor) {
      props.filters.constructor.call(this);
    }
  }

  while (++i < n) {
    this.onloadSubscribers[i].call(this);
  }

  return this;
};

Language.prototype.get = function (path, template = {}) {
  const raw = get(this.defs, path) || normalizePath(path).join(".");
  const tokens = [];
  let i = 1;
  const n = arguments.length;

  while (++i < n) {
    tokens.push(arguments[i]);
  }

  return typeof raw === "string"
    ? raw.replace(/\{\{([^}]+)\}\}/g, (a, b) => {
      // {{ filter argument argument argument }}
      // -> [ Function, Array ]
      // {{ variable | filter | filter }}
      // -> [ String, Function, Function ]

      return b
        .replace(/\$([0-9]+(?=\.[0-9]+|))/, replaceTokens(a))
        .split("|")
        .map((a) => {
          let b = a
            .split(" ")
            .map((a) => a.trim())
            .filter((a) => a);

          b[0] = (
            this.filter[b[0]]
              ? this.filter[b[0]]
              : template[b[0]] || b[0]
          );

          for (var i = 1, n = b.length; i < n; i++) {
            b[i] = template.hasOwnProperty(b[i]) ? template[b[i]] : b[i];
          }

          if (typeof b[0] === "function") {
            if (b.length > 1) {
              return b[0].apply(
                this,
                b.slice(1)
              );
            } else {
              return b[0];
            }
          }

          return b.join(" ");
        })
        .reduce((a, b) => {
          return b(a);
        });
    })
    : raw;
};

module.exports = Language;