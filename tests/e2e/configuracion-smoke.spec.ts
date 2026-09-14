import { expect, test } from "@playwright/test";

const API_ORIGIN = "http://10.2.5.68:8001";
const AUTH_ORIGIN = "http://10.2.5.68:5174";
const E2E_ORIGIN = "http://127.0.0.1:5190";

test.describe("Configuración - smoke de producción", () => {
  test("publica correctamente el documento principal", async ({ request }) => {
    const response = await request.get("/");

    expect(response.ok()).toBe(true);

    const html = await response.text();

    expect(html).toContain('<div id="root"></div>');
  });

  test("una sesión inexistente redirige al Login Access con callback seguro", async ({ page }) => {
    await page.route(`${API_ORIGIN}/auth/refresh`, async (route) => {
      await route.fulfill({
        status: 401,
        headers: {
          "access-control-allow-origin": E2E_ORIGIN,
          "access-control-allow-credentials": "true",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          detail: "Sesión no disponible para prueba E2E.",
          code: "UNAUTHORIZED",
        }),
      });
    });

    /*
     * Interceptamos Login Access para que esta prueba valide el contrato de
     * navegación sin depender de que otro frontend esté levantado.
     */
    await page.route(`${AUTH_ORIGIN}/**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: `
          <!doctype html>
          <html lang="es">
            <head>
              <title>Login Access E2E</title>
            </head>
            <body>
              <main>Destino Login Access interceptado por Playwright</main>
            </body>
          </html>
        `,
      });
    });

    await page.goto("/app/dashboard");

    await expect(page).toHaveURL(
      new RegExp(`^${AUTH_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/login(?:\\?|$)`),
    );

    const destination = new URL(page.url());

    expect(destination.origin).toBe(AUTH_ORIGIN);
    expect(destination.pathname).toBe("/login");

    expect(destination.searchParams.get("return_url")).toBe(`${E2E_ORIGIN}/app/dashboard`);
  });
});
