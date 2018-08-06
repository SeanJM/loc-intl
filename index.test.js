const tinyTest = require("tiny-test");
const Language = require("./index");

tinyTest(function (test, load) {
  test("Basic loading", function () {
    var l = new Language();

    l.load({
      localization: "english",
      defs: {
        test: "TEST"
      },
      filters: {
        lowerCase: function (value) {
          return value.toLowerCase();
        }
      }
    });

    return l.get("test");
  })
    .isEqual("TEST");

  test("Nested values (test.deep)", function () {
    var l = new Language();

    l.load({
      localization: "english",
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
      localization: "english",
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
    var l = new Language();

    l.load({
      localization: "english",
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
      localization: "english",
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

    return l.filters.lowerCase("TEST");
  })
    .isEqual("test");

  load();
});
