import { copyrightYears } from "./copyrightYears";

describe("copyrightYears", () => {
  it("is the single year in the year of first publication", () => {
    expect(copyrightYears(new Date("2025-06-01"))).toBe("2025");
  });

  it("widens to a range in later years", () => {
    expect(copyrightYears(new Date("2027-01-01"))).toBe("2025–2027");
  });
});
