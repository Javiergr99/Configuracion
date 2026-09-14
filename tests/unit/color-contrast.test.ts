import {
  getContrastLevel,
  getContrastRatio,
} from "@/features/appearance-settings/model/color-contrast";

describe("color contrast", () => {
  it("calcula el contraste máximo entre negro y blanco", () => {
    expect(getContrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(getContrastLevel("#000000", "#FFFFFF")).toBe("aa");
  });

  it("clasifica correctamente un contraste insuficiente", () => {
    expect(getContrastLevel("#FFFFFF", "#FFFFFF")).toBe("fail");
  });
});
