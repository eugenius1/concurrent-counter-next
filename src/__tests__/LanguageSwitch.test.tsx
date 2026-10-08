import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageSwitch from "../components/LanguageSwitch";
import { I18nProvider } from "../i18n/I18nProvider";
import sw from "../i18n/messages/sw";

describe("LanguageSwitch Component", () => {
  beforeEach(() => {
    document.cookie = "locale=; path=/; max-age=0";
    // jsdom can't reload, and says so loudly
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("lists English, then the browser's languages, then the rest by name", async () => {
    jest
      .spyOn(navigator, "languages", "get")
      .mockReturnValue(["sw-TZ", "sw", "en"]);
    const user = userEvent.setup();
    render(<LanguageSwitch />);

    await user.click(screen.getByRole("button", { name: "Language" }));

    const items = screen.getAllByRole("menuitemradio");
    expect(items.map((item) => item.textContent)).toEqual([
      "English",
      "Kiswahili",
      "Bahasa Indonesia",
      "Deutsch",
      "Español",
      "Français",
      "Naijá",
      "Português",
      "Tiếng Việt",
      "Русский",
      "اردو",
      "العربية",
      "مصرى",
      "मराठी",
      "हिन्दी",
      "বাংলা",
      "తెలుగు",
      "中文",
      "日本語",
    ]);
    expect(items[1]).toHaveAttribute("lang", "sw");
    expect(screen.getByRole("menuitemradio", { checked: true })).toBe(items[0]);
  });

  it("remembers the language picked", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);

    await user.click(screen.getByRole("button", { name: "Language" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Kiswahili" }));

    expect(document.cookie).toContain("locale=sw");
  });

  it("is labelled in the current language", () => {
    render(
      <I18nProvider locale="sw" messages={sw}>
        <LanguageSwitch />
      </I18nProvider>,
    );

    expect(screen.getByRole("button", { name: "Lugha" })).toBeInTheDocument();
  });
});
