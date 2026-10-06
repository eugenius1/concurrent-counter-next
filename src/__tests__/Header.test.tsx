import { render, screen } from "@testing-library/react";
import Header from "../components/Header";

jest.mock("../components/ModeSwitch", () => () => null);

describe("Header Component", () => {
  it("shows the app name as a link to the homepage", () => {
    render(<Header />);

    expect(
      screen.getByRole("link", { name: "Concurrent Counter" }),
    ).toHaveAttribute("href", "/");
  });
});
