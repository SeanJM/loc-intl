# Tongue JS (2.52Kb minified)
This is a micro library for adding localization to a project. It supports advanced features such as nested filters.

## Installation
```
$ npm i tongue-js
```

## Basic Usage
```js
const L = require("tongue-js");
const l = new L({
  defs: {
    frog: "grenouille",
    frogs: "grenouilles",
  }
});

l.get("frog"); // grenouille
```

## Filters
```js
const L = require("tongue-js");
const l = new L({
  defs: {
    frog: "grenouille",
    frogs: "grenouilles",
  },
  filters: {
    currency: function (s) {
      return "$ " + s;
    },
    pluralize: function (number, singular, plural) {
      return Number(number) > 1 ? plural : singular;
    }
  }
});

l.get("frog"); // grenouille
l.filters.currency(500); // $ 500
l.get("{{ currency 500 }}"); // $ 500
l.get("{{ pluralize 5 cat cats }}"); // cats
l.get("{{ pluralize 2 {{frog}} {{frogs}} }}"); // frogs
```

## Nesting filters
```js
const L = require("tongue-js");
const l = new L({
  defs: {
    frog: "grenouille",
    frogs: "grenouilles",
  },
  filters: {
    pluralize: function (number, singular, plural) {
      return Number(number) > 1 ? plural : singular;
    },
    capitalCase: function (str) {
      return str[0].toUpperCase() + str.substring(1);
    },
  }
});

l.get("{{ capitalCase {{ pluralize 2 {{frog}} {{frogs}} }} }}"); // Frogs
```

# License
MIT