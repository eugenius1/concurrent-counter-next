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

  it("lists the languages by number of speakers, each in its own name", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);

    await user.click(screen.getByRole("button", { name: "Language" }));

    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "English",
      "中文",
      "हिन्दी",
      "Español",
      "العربية",
      "Français",
      "বাংলা",
      "Português",
      "Bahasa Indonesia",
      "اردو",
      "Русский",
      "Deutsch",
      "日本語",
      "Naijá",
      "مصرى",
      "मराठी",
      "Tiếng Việt",
      "తెలుగు",
      "Kiswahili",
    ]);
    expect(items.at(-1)).toHaveAttribute("lang", "sw");
  });

  it("remembers the language picked", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitch />);

    await user.click(screen.getByRole("button", { name: "Language" }));
    await user.click(screen.getByRole("menuitem", { name: "Kiswahili" }));

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
