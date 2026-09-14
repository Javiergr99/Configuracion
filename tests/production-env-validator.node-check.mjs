import assert from "node:assert/strict";
import test from "node:test";

import { parseEnv, validateProductionEnv } from "../scripts/lib/production-env-validator.mjs";

const valid = {
  VITE_API_URL: "http://10.2.5.68:8001",
  VITE_AUTH_APP_URL: "http://10.2.5.68:5174/login",
  VITE_ENABLE_ADMIN_MOCKS: "false",
};

test("acepta un entorno de servidor completo", () => {
  assert.deepEqual(validateProductionEnv(valid), []);
});

test("rechaza variables obligatorias vacías", () => {
  assert.ok(validateProductionEnv({}).length >= 2);
});

test("rechaza localhost", () => {
  assert.ok(validateProductionEnv({ ...valid, VITE_API_URL: "http://localhost:8001" }).length);
});

test("rechaza loopback 127.x", () => {
  assert.ok(validateProductionEnv({ ...valid, VITE_API_URL: "http://127.0.0.1:8001" }).length);
});

test("rechaza slash final", () => {
  assert.ok(validateProductionEnv({ ...valid, VITE_API_URL: "http://10.2.5.68:8001/" }).length);
});

test("rechaza credenciales embebidas", () => {
  assert.ok(
    validateProductionEnv({
      ...valid,
      VITE_API_URL: "http://user:pass@10.2.5.68:8001",
    }).length,
  );
});

test("rechaza mocks administrativos", () => {
  assert.ok(validateProductionEnv({ ...valid, VITE_ENABLE_ADMIN_MOCKS: "true" }).length);
});

test("parseEnv respeta claves y valores", () => {
  assert.deepEqual(parseEnv("A=1\nB=dos\n"), { A: "1", B: "dos" });
});
