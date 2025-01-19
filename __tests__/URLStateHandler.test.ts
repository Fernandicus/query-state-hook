import { URLStateHandler } from "../src";

describe("On URLStateHandler", () => {
  it("Get State", async () => {
    const myUrl = "https://www.custom-url.com/path?form=a&form.input=c";
    const urlSearchParams = new URL(myUrl).search;

    const formUrlStateHandler = URLStateHandler.build({
      name: "form",
      values: ["a", "b", "c"],
      defaultValue: "c",
    });

    const state = formUrlStateHandler.getState(urlSearchParams);

    expect(state).toEqual("a");
  });

  it("Set State", async () => {
    const myUrl = "https://www.custom-url.com/path?form=a&form.input=c";
    const searchParams = new URL(myUrl).search;

    const formUrlStateHandler = URLStateHandler.build({
      name: "form",
      values: ["a", "b", "c"],
      defaultValue: "c",
    });

    const state = formUrlStateHandler.setState(searchParams, "b");

    const urlSearchParams = new URLSearchParams(searchParams);
    urlSearchParams.set("form", "b");

    expect(state).toEqual(urlSearchParams.toString());
  });

  it("Set invalid State will Set the default state", async () => {
    const myUrl = "https://www.custom-url.com/path?form=a&form.input=c";
    const searchParams = new URL(myUrl).search;

    const formUrlStateHandler = URLStateHandler.build<string>({
      name: "form",
      values: ["a", "b", "c"],
      defaultValue: "c",
    });

    const state = formUrlStateHandler.setState(searchParams, "z");

    expect(new URLSearchParams(state).get("form")).toEqual("c");
  });

  it("buildComposed constructor", async () => {
    const checkValidValues = ["x", "y", "z"];
    const checkUrlValues = ["x", "y", "o"];

    const myUrl = `https://www.custom-url.com/path?form.inpt=a&form.chks=${checkUrlValues.join(",")}`;
    const searchParams = new URL(myUrl).search;

    const formUrlStateHandler = URLStateHandler.buildComposed({
      key: "form",
      ids: {
        inpt: {
          defaultValue: "a",
          values: ["a", "b", "c"],
        },
        chks: {
          values: checkValidValues,
          defaultValue: "x",
        },
      },
    });

    const state = formUrlStateHandler.chks.getState(searchParams);

    const expectedResult = () => {
      const setOfValues = new Set(checkValidValues);
      const matchedValues = new Set(checkUrlValues).intersection(setOfValues);
      return Array.from(matchedValues);
    };

    expect(state).toEqual(expect.arrayContaining(expectedResult()));
  });

  it("buildComposed constructor, getState", async () => {
    const checkValidValues = ["x", "y", "z"];

    const myUrl = `https://www.custom-url.com/path?form.inpt=a}`;
    const searchParams = new URL(myUrl).search;

    const formUrlStateHandler = URLStateHandler.buildComposed({
      key: "form",
      ids: {
        inpt: {
          defaultValue: "a",
          values: ["a", "b", "c"],
        },
        chks: {
          values: checkValidValues,
          defaultValue: "x",
        },
      },
    });

    const state = formUrlStateHandler.chks.getState(searchParams);

    expect(state).toEqual("x");
  });

  it("buildComposed constructor, setState", async () => {
    const checkValidValues = ["x", "y", "z"];
    const checkUrlValues = ["x", "y", "o"];

    const myUrl = `https://www.custom-url.com/path?form.inpt=a&form.chks=${checkUrlValues.join(",")}`;
    const searchParams = new URL(myUrl).search;

    const formUrlStateHandler = URLStateHandler.buildComposed({
      key: "form",
      ids: {
        inpt: {
          defaultValue: "a",
          values: ["a", "b", "c"],
        },
        chks: {
          values: checkValidValues,
          defaultValue: "x",
        },
      },
    });

    const state = formUrlStateHandler.chks.setState(searchParams, "m");

    expect(new URLSearchParams(state).get("form.chks")).toEqual("x");
  });

  it("withCustomValidation constructor", async () => {
    const myUrl = `https://www.custom-url.com/path?year=2010`;
    const searchParams = new URL(myUrl).search;

    const formUrlStateHandler = URLStateHandler.withCustomValidation({
      name: "year",
      getState(urlSearchParams) {
        const yearString = urlSearchParams.get("year");
        const year = parseInt(yearString);
        const currentYear = new Date().getFullYear();

        if (isNaN(year) || year > currentYear) return currentYear;

        return year;
      },
      setState(urlSearchParams, v) {
        const year = parseInt(v);

        if (!year || isNaN(year)) {
          urlSearchParams.set("year", new Date().getFullYear().toString());
          return urlSearchParams;
        }

        urlSearchParams.set("year", v);
        return urlSearchParams;
      },
    });

    const setState = formUrlStateHandler.setState(searchParams, "2010");
    const getState = formUrlStateHandler.getState(searchParams);

    expect(setState).toEqual("year=2010");
    expect(getState).toEqual(2010);
  });
});
