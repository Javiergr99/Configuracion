import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SelectField } from "@/components/ui/select-field";

describe("SelectField controlled synchronization", () => {
  it("refleja un valor cargado después del primer render sin vaciarlo", () => {
    const onValueChange = vi.fn();
    const view = render(
      <SelectField
        label="Estatus"
        value=""
        onValueChange={onValueChange}
        options={["Activo", "Inactivo"]}
      />,
    );

    view.rerender(
      <SelectField
        label="Estatus"
        value="Activo"
        onValueChange={onValueChange}
        options={["Activo", "Inactivo"]}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Estatus" })).toHaveTextContent("Activo");
    expect(onValueChange).not.toHaveBeenCalledWith("");
  });
});
