import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("muestra su contenido y conserva el tipo button por defecto", () => {
    render(<Button>Guardar</Button>);
    const button = screen.getByRole("button", { name: "Guardar" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
  });
});
