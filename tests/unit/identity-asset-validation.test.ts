import { describe, expect, it } from "vitest";

import { validateIdentityAsset } from "@/features/appearance-settings/model/identity-asset-validation";

describe("validateIdentityAsset", () => {
  it("accepts a supported institutional image", () => {
    const file = new File(["logo"], "logo.svg", { type: "image/svg+xml" });
    expect(validateIdentityAsset(file)).toBeNull();
  });

  it("rejects unsupported files", () => {
    const file = new File(["document"], "logo.pdf", { type: "application/pdf" });
    expect(validateIdentityAsset(file)).toContain("Formato no compatible");
  });

  it("rejects files larger than two megabytes", () => {
    const file = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "logo.png", { type: "image/png" });
    expect(validateIdentityAsset(file)).toContain("2 MB");
  });
});
