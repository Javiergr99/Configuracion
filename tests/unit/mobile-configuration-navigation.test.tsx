import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ConfigurationSidebar } from "@/components/layout/configuration-sidebar";

describe("drawer responsive de Configuración", () => {
  it("oculta módulos restringidos cuando faltan permisos", () => {
    render(
      <MemoryRouter>
        <ConfigurationSidebar variant="drawer" permissions={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Resumen" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Usuarios" })).not.toBeInTheDocument();
  });

  it("expande Usuarios y filtra las opciones hijas", () => {
    const onNavigate = vi.fn();

    render(
      <MemoryRouter>
        <ConfigurationSidebar
          variant="drawer"
          permissions={["VER_USUARIOS"]}
          onNavigate={onNavigate}
        />
      </MemoryRouter>,
    );

    const users = screen.getByRole("button", { name: "Usuarios" });

    expect(users).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(users);

    expect(users).toHaveAttribute("aria-expanded", "true");
    expect(onNavigate).not.toHaveBeenCalled();

    const manage = screen.getByRole("link", { name: "Administrar usuarios" });

    expect(screen.queryByRole("link", { name: "Crear usuario" })).not.toBeInTheDocument();

    fireEvent.click(manage);

    expect(onNavigate).toHaveBeenCalledOnce();
  });

  it("permite Crear usuario solo con el permiso correspondiente", () => {
    render(
      <MemoryRouter>
        <ConfigurationSidebar variant="drawer" permissions={["CREAR_USUARIO"]} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Usuarios" }));

    expect(screen.getByRole("link", { name: "Crear usuario" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Administrar usuarios" })).not.toBeInTheDocument();
  });
});
