const tinyTest = require("tiny-test");
const Language = require("./index.min");

tinyTest(function (test, load) {
  test("Basic", function () {
    var l = new Language();

    l.load({
      defs: {
        test: "TEST"
      }
    });

    return l.get("test");
  })
    .isEqual("TEST");

  test("Tokens", function () {
    var l = new Language();

    l.load({
      defs: {
        test: "TEST"
      }
    });

    return l.get("{{0}}", "TEST");
  })
    .isEqual("TEST");

  test("Filter: upperCase token", function () {
    var l = new Language();

    l.load({
      defs: {
        test: "Test"
      },
      filters: {
        upperCase(s) {
          return s.toUpperCase();
        }
      }
    });

    return l.get("{{upperCase {{0}}}}", "Test");
  })
    .isEqual("TEST");

  test("Filter: upperCase value", function () {
    var l = new Language();

    l.load({
      defs: {
        test: "Test"
      },
      filters: {
        upperCase(s) {
          return s.toUpperCase();
        }
      }
    });

    return l.get("{{upperCase {{test}}}}");
  })
    .isEqual("TEST");

  test("Filter: pluralize", function () {
    var l = new Language();

    l.load({
      defs: {
        cat: "chat",
        cats: "chats"
      },
      filters: {
        pluralize(number, s, p) {
          return Number(number) > 1 ? p : s;
        }
      }
    });

    return [
      l.get("{{ pluralize 2 {{cat}} {{cats}} }}"),
      l.get("{{ pluralize 1 {{cat}} {{cats}} }}")
    ];
  })
    .isDeepEqual(["chats", "chat"]);

  test("Filter: pluralize string", function () {
    var l = new Language();

    l.load({
      defs: {
        cat: "chat",
        cats: "chats"
      },
      filters: {
        pluralize(number, s, p) {
          return Number(number) > 1 ? p : s;
        }
      }
    });

    return [
      l.get("{{ pluralize 2 cat cats }}"),
      l.get("{{ pluralize 1 cat cats }}")
    ];
  })
    .isDeepEqual(["cats", "cat"]);

  test("Filter: pluralize string and template", function () {
    var l = new Language({
      defs: {
        cat: "chat",
        cats: "chats"
      },
      filters: {
        pluralize(number, s, p) {
          return Number(number) > 1 ? p : s;
        }
      }
    });
    return [
      l.get("{{ pluralize 2 cat {{cats}} }}"),
      l.get("{{ pluralize 1 cat {{cats}} }}")
    ];
  })
    .isDeepEqual(["chats", "cat"]);

  test("Filter: pluralize string and template -> capitalCase", function () {
    var l = new Language({
      defs: {
        cat: "chat",
        cats: "chats"
      },
      filters: {
        capitalCase(s) {
          return s[0].toUpperCase() + s.substring(1);
        },
        pluralize(number, s, p) {
          return Number(number) > 1 ? p : s;
        }
      }
    });
    return [
      l.get("{{ capitalCase {{ pluralize 2 cat {{cats}} }} }}"),
      l.get("{{ capitalCase {{ pluralize 1 cat {{cats}} }} }}")
    ];
  })
    .isDeepEqual(["Chats", "Cat"]);

  test("Nested values (test.deep)", function () {
    var l = new Language();

    l.load({
      defs: {
        test: {
          deep: "TEST"
        }
      }
    });

    return l.get("test.deep");
  })
    .isEqual("TEST");

  test("Nested values as an array", function () {
    var l = new Language();

    l.load({
      defs: {
        test: {
          deep: "TEST"
        }
      }
    });

    return l.get(["test", "deep"]);
  })
    .isEqual("TEST");

  test("key values", function () {
    var l = new Language({
      defs: {
        test: {
          deep: "{{number}} cats"
        }
      }
    });

    return l.get(["test", "deep"], { number: 5 });
  })
    .isEqual("5 cats");

  test("filter", function () {
    var l = new Language();

    l.load({
      defs: {
        test: "{{lowerCase TEST}}"
      },
      filters: {
        lowerCase: function (value) {
          return value.toLowerCase();
        }
      }
    });

    return l.get("test");
  })
    .isEqual("test");

  test("filter as a function", function () {
    var l = new Language();

    l.load({
      filters: {
        lowerCase: function (value) {
          return value.toLowerCase();
        }
      }
    });

    return l.filter.lowerCase("TEST");
  })
    .isEqual("test");

  test("Tokens", function () {
    var l = new Language();
    return l.get("{{0}}", "Test");
  })
    .isEqual("Test");

  test("Multiple tokens", function () {
    var l = new Language();
    return l.get("{{0}} {{1}}", "Test", "One");
  })
    .isEqual("Test One");

  test("Multiple expressions with path", function () {
    var l = new Language({
      defs: {
        label: {
          "date range": "Date range"
        }
      }
    });
    return l.get("{{label.date range}}: {{0}} - {{1}}", "2018-06-01", "2018-08-13");
  }).isDeepEqual("Date range: 2018-06-01 - 2018-08-13");

  test("Replace value 0 - template", function () {
    var l = new Language();
    return l.get("{{x}}", { x: 0 });
  }).isDeepEqual("0");

  test("Replace value 0 - token", function () {
    var l = new Language();
    return l.get("{{0}}", 0);
  }).isDeepEqual("0");

  test("Get null", function () {
    var l = new Language();
    return l.get(null) == null;
  }).isEqual(true);

  test("Get null value to filter", function () {
    var l = new Language({
      filters: {
        something(value) {
          return value;
        }
      }
    });
    return l.get("{{ something {{Nothing}} }}", { Nothing: null }) == null;
  }).isEqual(true);

  load();
});
