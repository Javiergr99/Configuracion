# Calidad

## Validaciones ejecutadas durante la separación

```text
validate:structure ✅
typecheck          ✅
lint               ✅
```

## Validaciones pendientes en Windows

El ZIP de origen incluía `node_modules` instalado en Windows. Vite/Vitest usan binarios nativos de Rolldown; esos binarios no pueden ejecutarse en el entorno Linux utilizado para preparar esta entrega.

Después de instalar dependencias normalmente en Windows:

```powershell
npm install
npm run test
npm run build
npx -y react-doctor@latest . --scope full --score
```

No se debe asumir el resultado de estas tres últimas verificaciones hasta ejecutarlas en el proyecto local.
