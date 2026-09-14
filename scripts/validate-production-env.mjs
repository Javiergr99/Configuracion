import fs from "node:fs";
import path from "node:path";
import { parseEnv, REQUIRED_KEYS, validateProductionEnv } from "./lib/production-env-validator.mjs";

const root = process.cwd();
const candidates = [".env", ".env.local", ".env.production", ".env.production.local"];
const detected = [];
const effective = {};
for (const name of candidates) {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) continue;
  detected.push(name);
  Object.assign(effective, parseEnv(fs.readFileSync(file, "utf8")));
}

console.log("======================================================");
console.log(" CONFIGURACION - VALIDACION DE ENTORNO PRODUCCION");
console.log("======================================================");
console.log(`Archivos de entorno detectados: ${detected.length ? detected.join(", ") : "ninguno"}`);
console.log(`Variables requeridas: ${REQUIRED_KEYS.join(", ")}`);

const errors = validateProductionEnv({ ...effective, ...process.env });
if (errors.length) {
  console.error("FAIL: entorno de producción inválido");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("PASS: variables de producción válidas.");
console.log("PASS: sin localhost/loopback.");
console.log("PASS: mocks administrativos deshabilitados.");
console.log("PASS: sin credenciales embebidas ni slash final.");
