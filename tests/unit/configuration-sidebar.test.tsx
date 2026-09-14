import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import { ConfigurationSidebar } from "@/components/layout/configuration-sidebar";

const SUPER_ADMIN = ["SUPER_ADMIN"] as const;

describe("ConfigurationSidebar", () => {
  it("cierra un grupo expandido manualmente al navegar a otra opción principal", async () => {
    render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <ConfigurationSidebar permissions={SUPER_ADMIN} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Usuarios" }));
    expect(screen.getByRole("link", { name: "Administrar usuarios" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "Perfiles" }));

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: "Administrar usuarios" })).not.toBeInTheDocument();
    });
  });

  it("permite abrir y cerrar Usuarios incluso cuando la ruta activa pertenece al grupo", () => {
    render(
      <MemoryRouter initialEntries={["/app/usuarios/nuevo"]}>
        <ConfigurationSidebar permissions={SUPER_ADMIN} />
      </MemoryRouter>,
    );

    const usersButton = screen.getByRole("button", { name: "Usuarios" });
    expect(usersButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(usersButton);
    expect(usersButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Crear usuario" })).toBeInTheDocument();

    fireEvent.click(usersButton);
    expect(usersButton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Crear usuario" })).not.toBeInTheDocument();
  });

  it("cierra Usuarios después de seleccionar una opción hija", async () => {
    render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <ConfigurationSidebar permissions={SUPER_ADMIN} />
      </MemoryRouter>,
    );

    const usersButton = screen.getByRole("button", { name: "Usuarios" });
    fireEvent.click(usersButton);
    expect(usersButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("link", { name: "Crear usuario" }));

    await waitFor(() => {
      expect(usersButton).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("link", { name: "Crear usuario" })).not.toBeInTheDocument();
    });
  });

  it("homologa tamaño de texto e icono del grupo Usuarios con los menús principales", () => {
    render(
      <MemoryRouter initialEntries={["/app/dashboard"]}>
        <ConfigurationSidebar permissions={SUPER_ADMIN} />
      </MemoryRouter>,
    );

    const usersButton = screen.getByRole("button", { name: "Usuarios" });
    const summaryLink = screen.getByRole("link", { name: "Resumen" });
    const usersIcon = usersButton.querySelector("svg");
    const summaryIcon = summaryLink.querySelector("svg");

    expect(usersButton).toHaveClass("text-[13px]", "leading-5");
    expect(summaryLink).toHaveClass("text-[13px]", "leading-5");
    expect(usersIcon).toHaveClass("h-[17px]", "w-[17px]");
    expect(summaryIcon).toHaveClass("h-[17px]", "w-[17px]");
  });
});
