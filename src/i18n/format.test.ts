import { fill, plural } from "./format";
import ar from "./messages/ar";
import en from "./messages/en";
import ru from "./messages/ru";

describe("fill", () => {
  it("replaces each placeholder with its value", () => {
    expect(fill("{a} and {b} and {a}", { a: 1, b: "two" })).toBe(
      "1 and two and 1",
    );
  });

  it("leaves a placeholder it has no value for", () => {
    expect(fill("Counter #{id}", {})).toBe("Counter #{id}");
  });
});

describe("plural", () => {
  it("picks the singular and the plural in English", () => {
    expect(plural("en", en.countersCreated, 1)).toBe(
      "1 counter created so far",
    );
    expect(plural("en", en.countersCreated, 1234)).toBe(
      "1,234 counters created so far",
    );
  });

  it("follows Russian's three forms", () => {
    expect(plural("ru", ru.countersCreated, 1)).toBe(
      ru.countersCreated.one!.replace("{count}", "1"),
    );
    expect(plural("ru", ru.countersCreated, 3)).toContain("счётчика");
    expect(plural("ru", ru.countersCreated, 5)).toContain("счётчиков");
    expect(plural("ru", ru.countersCreated, 21)).toContain("счётчик");
  });

  it("follows Arabic's six forms", () => {
    expect(plural("ar", ar.countersCreated, 0)).toBe(ar.countersCreated.zero);
    expect(plural("ar", ar.countersCreated, 1)).toBe(ar.countersCreated.one);
    expect(plural("ar", ar.countersCreated, 2)).toBe(ar.countersCreated.two);
    expect(plural("ar", ar.countersCreated, 5)).toContain("عدّادات");
    expect(plural("ar", ar.countersCreated, 11)).toContain("عدّادًا");
  });

  it("falls back to the general form when a category has none", () => {
    expect(plural("en", { other: "{count} things" }, 1)).toBe("1 things");
  });
});
