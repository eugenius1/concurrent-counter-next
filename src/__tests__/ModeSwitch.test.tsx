import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@mui/material/styles";
import ModeSwitch from "../components/ModeSwitch";
import theme from "../theme";

function renderSwitch() {
  return render(
    <ThemeProvider theme={theme}>
      <ModeSwitch />
    </ThemeProvider>,
  );
}

describe("ModeSwitch Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("is an icon button that names the current theme", async () => {
    renderSwitch();

    expect(
      await screen.findByRole("button", { name: "Theme: System" }),
    ).toBeInTheDocument();
  });

  it("offers the three themes and applies the one picked", async () => {
    const user = userEvent.setup();
    renderSwitch();

    await user.click(
      await screen.findByRole("button", { name: "Theme: System" }),
    );
    expect(
      screen.getAllByRole("menuitemradio").map((item) => item.textContent),
    ).toEqual(["System", "Light", "Dark"]);
    expect(
      screen.getByRole("menuitemradio", { checked: true }),
    ).toHaveTextContent("System");

    await user.click(screen.getByRole("menuitemradio", { name: "Dark" }));

    expect(
      await screen.findByRole("button", { name: "Theme: Dark" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
