(function (window) {
  function normalizePath(path) {
    return [].concat(path).join(".").split(".");
  }

  function getExpression(str) {
    var i = str.indexOf("{{");
    var o = 1;
    var n = str.length;
    var s = i;

    if (i > -1) {
      i += 1;
      while (i < n && o > 0) {
        if (str.substring(i, i + 2) === "{{") {
          i += 1;
          o += 1;
        } else if (str.substring(i, i + 2) === "}}") {
          i += 2;
          o -= 1;
        } else {
          i++;
        }
      }

      return {
        outter: str.substring(s, i),
        string: str,
        start: s,
        end: i,
        value: str.substring(s + 2, i - 2).trim(),
      };
    }

    return null;
  }

  function filterExpression(self, value, template, tokens) {
    var expression;

    var split = value.split(" ");
    var fn = self.filter[split[0]];
    var str = split.slice(1).join(" ");
    var args = [""];
    var index = 0;

    var i = -1;
    var n = str.length;

    if (fn) {
      while (++i < n) {
        if (!args[index]) {
          args[index] = "";
        }

        if (str.substring(i, i + 2) === "{{") {
          expression = getExpression(str.substring(i));
          if (expression) {
            i += expression.end;
            args[index] = evaluateExpression(self, expression.outter, template, tokens);
            index += 1;
          } else {
            args[index] += str[i];
          }
        } else if (/\s/.test(str[i]) && !/\s/.test(str[i - 1])) {
          index += 1;
        } else {
          args[index] += str[i];
        }
      }

      return fn.apply(self, args);
    }

    return value;
  }

  function replaceExpression(self, expression, template, tokens) {
    var left = expression.string.substring(0, expression.start);
    var right = expression.string.substring(expression.end, expression.string.length);
    var center = expression.value;

    if (tokens.length && typeof tokens[Number(center)] !== "undefined") {
      center = tokens[Number(center)];
    } else if (get(template, center)) {
      center = get(template, center);
    } else if (get(self.defs, center)) {
      center = get(self.defs, center);
    }

    center = "" + center;
    center = filterExpression(self, center, template, tokens);
    center = evaluateExpression(self, center, template, tokens);

    return left + center + right;
  }

  function evaluateExpression(self, string, template, tokens) {
    var res = string;
    var expression = getExpression(res);

    while (expression) {
      res = replaceExpression(self, expression, template, tokens);
      expression = getExpression(res);
    }

    return res;
  }

  function get(obj, path) {
    var p = obj;
    var s = normalizePath(path);

    for (var i = 0, n = s.length - 1; i < n; i++) {
      if (p && typeof p[s[i]] !== "undefined") {
        p = p[s[i]];
      } else {
        return undefined;
      }
    }

    return p[s.slice(-1)[0]];
  }

  /**
   * @param {object=} props
   * @param {object=} props.defs Language definitions
   * @param {object=} props.filter Language filters
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
    var index = this.onloadSubscribers.indexOf(callback);
    if (index > -1) {
      this.onloadSubscribers.splice(index, 1);
    }
    return this;
  };

  /**
   * @param {object=} props
   * @param {object=} props.defs Language definitions
   * @param {object=} props.filter Language filters
  */

  Language.prototype.load = function (props) {
    var i = -1;
    var n = this.onloadSubscribers.length;

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

  /**
   * @param {string|array} path
   * @param {object=} template A template to process
   * @returns {string|undefined};
  */

  Language.prototype.get = function (path, template) {
    var raw = get(this.defs, path) || normalizePath(path).join(".");
    var tokens = [];
    var i = 0;
    var n = arguments.length;

    template = template || {};

    while (++i < n) {
      tokens.push(arguments[i]);
    }

    return typeof raw === "string"
      ? evaluateExpression(this, raw, template, tokens)
      : raw;
  };

  if (module) {
    module.exports = Language;
  } else if (typeof window === "object") {
    window.Language = Language;
  }
}(typeof window === "undefined" ? null : window));