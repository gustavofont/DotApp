import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Nav } from "./Nav";

const logout = vi.fn();

vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => ({ logout }),
}));

function renderNav(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Nav />
    </MemoryRouter>,
  );
}

describe("Nav", () => {
  it("renders a link to every protected screen", () => {
    renderNav("/");

    for (const label of ["Home", "Catálogo", "Acervo", "Amigos", "Trocas"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("marks the current route's link as active", () => {
    renderNav("/catalog");

    expect(screen.getByRole("link", { name: "Catálogo" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("calls logout when 'Sair' is clicked", () => {
    renderNav("/");

    fireEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(logout).toHaveBeenCalledOnce();
  });
});
