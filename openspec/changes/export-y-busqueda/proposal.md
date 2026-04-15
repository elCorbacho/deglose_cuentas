# Proposal: Export y búsqueda de transacciones

## Intent

Mejorar el valor inmediato para el usuario habilitando tres quick wins: exportar resultados, encontrar movimientos rápido y analizar múltiples estados de cuenta en una sola corrida, sin cambiar stack ni persistencia.

## Scope

### In Scope

- Exportar transacciones **filtradas** a archivo CSV descargable (compatible con Excel).
- Agregar barra de búsqueda por texto sobre transacciones (comercio, descripción/raw y monto).
- Permitir carga de múltiples PDFs en una operación y consolidar transacciones.

### Out of Scope

- Autenticación, historial en backend, base de datos o cuentas por usuario.
- Exportación XLSX nativa (si se necesita, queda como extensión futura).

## Capabilities

### New Capabilities

- `transaction-export`: descarga de dataset filtrado en CSV con columnas consistentes y encoding seguro.
- `transaction-search`: filtrado por texto y monto aplicado sobre la grilla/listado de transacciones.
- `multi-pdf-ingestion`: ingesta de múltiples PDFs y agregación de transacciones en un único estado analizable.

### Modified Capabilities

- None (no existen specs base en `openspec/specs/` al momento de esta propuesta).

## Approach

Implementación frontend-first en `App` y componentes de análisis: pipeline de filtros por etapas (fecha → búsqueda), exportador CSV utilitario y adaptación de `FileUpload` para `FileList`/array. Se reutiliza parser y categorizador actuales; en multi-PDF se concatena resultado parseado por archivo y luego se categoriza en conjunto.

## Affected Areas

| Area                                        | Impact   | Description                                                        |
| ------------------------------------------- | -------- | ------------------------------------------------------------------ |
| `src/components/organisms/FileUpload.tsx`   | Modified | Soporte multiple, validación y UX de selección múltiple            |
| `src/App.tsx`                               | Modified | Orquestación multi-PDF, búsqueda y export del subconjunto filtrado |
| `src/components/organisms/CategoryList.tsx` | Modified | Consumo de lista filtrada por búsqueda                             |
| `src/lib/` (nuevo util)                     | New      | Generación de CSV (escape, headers, download)                      |
| `src/types/index.ts`                        | Modified | Tipos para estado de búsqueda/export y metadatos de archivos       |

## Risks

| Risk                                             | Likelihood | Mitigation                                                                         |
| ------------------------------------------------ | ---------- | ---------------------------------------------------------------------------------- |
| Parser regex falle con PDFs heterogéneos         | Med        | Mantener parse por archivo + tolerancia a errores parciales y feedback por archivo |
| Crecimiento de memoria/localStorage al unir PDFs | Med        | No persistir payload crudo completo y aplicar límites por cantidad/tamaño          |
| Búsqueda degrade UX con alto volumen             | Low        | `useMemo` + normalización simple + debounce corto opcional                         |

## Rollback Plan

Revertir a flujo actual de archivo único y sin búsqueda/export: desactivar controles nuevos en UI y restaurar `onFileLoaded(file)` único. Si hay incidentes, rollback por commit revert sin migraciones de datos.

## Dependencies

- APIs nativas del navegador (`Blob`, `URL.createObjectURL`) para CSV.
- Sin dependencias nuevas obligatorias.

## Success Criteria

- [ ] Usuario puede cargar 2+ PDFs y ver transacciones consolidadas en una sola vista.
- [ ] Usuario puede filtrar por texto/monto y el resultado impacta métricas/listados visibles.
- [ ] Usuario puede descargar CSV del conjunto actualmente filtrado y abrirlo en Excel.
