# Configuración visual — Identidad

La categoría **Identidad** reutiliza el App Shell y la navegación interna de Configuración visual. Se implementó como una sección del mismo módulo, sin crear una página paralela.

## Componentes reutilizables

- `SettingsSection`: estructura común para las categorías de configuración.
- `SettingsField`: etiqueta, estado editado y contenido de un control.
- `SettingsTextControl`: campos de texto compactos sobre `Input` y `Textarea` existentes.
- `IdentityAssetUploader`: carga y validación reutilizable de recursos gráficos.
- `IdentityCurrentAsset`: vista del recurso actual con reemplazo y eliminación.
- `SettingsSwitch`: interruptor atómico para reglas visuales.
- `AlternativeAssetRow`: patrón reutilizable de recursos alternativos.
- `IdentitySettingsPreview`: vista previa específica de identidad.

## Estado actual

Los campos de identidad se guardan como borrador local mientras se define el contrato de persistencia global de configuración. Los archivos seleccionados se mantienen como previsualizaciones de la sesión del navegador y no se presentan como cargas persistidas en backend.

La publicación global continúa pendiente del contrato de backend para Design Tokens y recursos institucionales.

## Identidad del acceso Configuración

El tema predeterminado de Configuración utiliza la misma familia cromática naranja/ámbar de su acceso en Login Access. El sidebar adopta el tono primario accesible (`#a85400`) y texto blanco por defecto; los estados activos continúan usando los tokens semánticos de marca.

La migración del runtime actualiza únicamente la combinación predeterminada anterior del sidebar. Si un administrador ya definió colores personalizados para `sidebar` o `sidebarText`, esos valores se conservan.

## Balance cromático del acceso

La identidad naranja/ámbar se utiliza como eje visual del acceso Configuración, sin convertir todos los estados de la interfaz en un único color. Los acentos decorativos de navegación, tarjetas de resumen y módulos de Perfiles se mantienen dentro de la familia de marca; los colores semánticos continúan reservados para estados reales como éxito, advertencia, error, bloqueo o información.

El submenú `Usuarios` se cierra al navegar mediante una opción principal ajena al grupo. Si la ruta activa pertenece a Usuarios, el grupo se abre de forma derivada para conservar contexto de navegación sin mantener expansiones manuales obsoletas.
