import { intlTag, LOCALES } from "../locales";
import { loadMessages } from ".";
import en, { type PluralForms } from "./en";

const placeholders = (text: string) =>
  [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe.each(LOCALES.map(({ code }) => code))("%s messages", (code) => {
  const keys = Object.keys(en) as (keyof typeof en)[];

  it("has exactly the messages English has", async () => {
    const messages = await loadMessages(code);

    expect(Object.keys(messages).sort()).toEqual([...keys].sort());
    for (const key of keys) {
      expect(typeof messages[key]).toBe(typeof en[key]);
      if (typeof messages[key] === "string") {
        expect(messages[key].trim()).not.toBe("");
      }
    }
  });

  it("keeps every placeholder", async () => {
    const messages = await loadMessages(code);

    for (const key of keys) {
      const source = en[key];
      const translated = messages[key];
      if (typeof source === "string") {
        expect([key, placeholders(translated as string)]).toEqual([
          key,
          placeholders(source),
        ]);
      } else {
        // A form for one exact number may spell it out instead
        expect([key, placeholders((translated as PluralForms).other)]).toEqual([
          key,
          placeholders(source.other),
        ]);
      }
    }
  });

  it("has a form for every plural category of the language", async () => {
    const messages = await loadMessages(code);
    const { pluralCategories } = new Intl.PluralRules(
      intlTag(code),
    ).resolvedOptions();

    for (const key of keys) {
      const translated = messages[key];
      if (typeof translated === "string") continue;
      expect([key, Object.keys(translated).sort()]).toEqual([
        key,
        [...pluralCategories].sort(),
      ]);
    }
  });
});
