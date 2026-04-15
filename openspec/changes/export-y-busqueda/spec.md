# Delta Spec: Export y Búsqueda

## ADDED Requirements

### Requirement: Multi-PDF Ingestion

El sistema MUST permitir la carga simultánea de múltiples archivos PDF y consolidar sus transacciones en un único dataset analizable.

#### Scenario: Carga exitosa de múltiples PDFs

- GIVEN que el usuario selecciona 2 o más archivos PDF válidos
- WHEN el sistema procesa cada archivo secuencialmente
- THEN todas las transacciones extraídas se consolidan en una única lista
- AND se muestra el total de archivos procesados y transacciones encontradas

#### Scenario: Error parcial en uno de los PDFs

- GIVEN que el usuario selecciona múltiples PDFs donde uno es inválido o no parseable
- WHEN el sistema procesa los archivos
- THEN se procesan exitosamente los PDFs válidos
- AND se muestra un mensaje de error específico para el archivo fallido
- AND el usuario puede continuar con las transacciones extraídas exitosamente

#### Scenario: Límite de archivos excedido

- GIVEN que el usuario intenta cargar más de 10 archivos PDF simultáneamente
- WHEN se inicia la carga
- THEN el sistema rechaza la operación
- AND muestra un mensaje indicando el límite máximo permitido

---

### Requirement: Transaction Search

El sistema MUST proporcionar una barra de búsqueda que filtre transacciones por texto (comercio, descripción o monto) aplicado sobre el dataset actual.

#### Scenario: Búsqueda por comercio

- GIVEN que hay transacciones cargadas
- WHEN el usuario ingresa "Supermercado" en la barra de búsqueda
- THEN se muestran únicamente las transacciones cuyo comercio contenga ese texto
- AND las métricas y gráficos se actualizan para reflejar el subconjunto filtrado

#### Scenario: Búsqueda por monto

- GIVEN que hay transacciones cargadas
- WHEN el usuario ingresa "$1.250" o "1250" en la barra de búsqueda
- THEN se muestran las transacciones cuyo monto coincida o contenga ese valor
- AND la búsqueda es insensible a formato de moneda

#### Scenario: Búsqueda sin resultados

- GIVEN que hay transacciones cargadas
- WHEN el usuario ingresa un término que no existe en ninguna transacción
- THEN se muestra un mensaje "No se encontraron transacciones"
- AND se ofrece un botón para limpiar la búsqueda

#### Scenario: Limpieza de búsqueda

- GIVEN que existe un filtro de búsqueda activo
- WHEN el usuario hace clic en el botón "Limpiar" o borra el texto
- THEN se restauran todas las transacciones visibles
- AND las métricas vuelven a reflejar el dataset completo

---

### Requirement: CSV Export

El sistema MUST permitir la descarga del dataset actualmente filtrado como archivo CSV compatible con Excel.

#### Scenario: Exportación de transacciones filtradas

- GIVEN que hay transacciones visibles (filtradas o no)
- WHEN el usuario hace clic en "Exportar CSV"
- THEN se genera un archivo CSV con todas las columnas relevantes
- AND el archivo se descarga automáticamente en el navegador
- AND el encoding es UTF-8 con BOM para compatibilidad con Excel

#### Scenario: CSV con datos correctamente escapados

- GIVEN que hay transacciones con comas o saltos de línea en la descripción
- WHEN se exporta a CSV
- THEN los campos con caracteres especiales están correctamente entrecomillados
- AND el archivo se abre correctamente en Excel sin desplazamiento de columnas

#### Scenario: Exportación sin transacciones

- GIVEN que no hay transacciones cargadas o el filtro actual retorna vacío
- WHEN el usuario intenta exportar
- THEN el botón de exportación está deshabilitado
- AND se muestra un tooltip indicando "No hay datos para exportar"

---

## NON-FUNCTIONAL Requirements

### Performance

- La búsqueda MUST responder en menos de 100ms para datasets de hasta 1000 transacciones
- El sistema SHOULD usar `useMemo` para evitar recálculos innecesarios del filtrado
- La carga de múltiples PDFs MUST procesarse de forma no bloqueante para la UI

### Accessibility

- La barra de búsqueda MUST tener atributo `aria-label` descriptivo
- El botón de exportación MUST ser alcanzable por teclado (tabindex)
- Los mensajes de error de carga de PDFs MUST ser anunciados por screen readers (`role="alert"`)

### Browser Compatibility

- La descarga de CSV MUST funcionar en Chrome, Firefox, Safari y Edge
- El sistema MUST usar `Blob` y `URL.createObjectURL` para la generación del archivo

---

## EDGE CASES

| Caso                                      | Comportamiento Esperado                                                                                         |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| PDFs duplicados seleccionados             | Procesar normalmente, las transacciones aparecerán duplicadas en el dataset (el usuario verá montos duplicados) |
| Búsqueda con solo espacios                | Tratar como búsqueda vacía, mostrar todas las transacciones                                                     |
| Búsqueda con caracteres especiales regex  | Escapar automáticamente, tratar como texto literal                                                              |
| Nombres de archivo con caracteres Unicode | Preservar nombres en feedback de error/success                                                                  |
| CSV con campos vacíos                     | Exportar como celda vacía (no "undefined" ni "null")                                                            |
| Fecha inválida en transacción             | Exportar el valor original tal como aparece en el PDF                                                           |
| Archivo PDF corrupto                      | Capturar error, continuar con otros archivos, mostrar error específico                                          |
| Archivo no-PDF seleccionado               | Rechazar en validación, mostrar error de tipo de archivo                                                        |

---

## OUT OF SCOPE

Las siguientes funcionalidades están explícitamente EXCLUIDAS de este cambio:

- Autenticación de usuarios o gestión de sesiones
- Historial persistente en backend o base de datos
- Cuentas por usuario o multi-tenancy
- Exportación a formatos distintos de CSV (XLSX, JSON, etc.)
- Edición o modificación de transacciones extraídas
- Clasificación automática de transacciones con IA/ML
- Sincronización con servicios cloud (Google Drive, Dropbox)
- Filtrado por rango de fechas (fuera del alcance de esta búsqueda)
- Ordenamiento de columnas en la exportación

---

## ACCEPTANCE CRITERIA

- [ ] Usuario puede cargar 2+ PDFs y ver transacciones consolidadas en una sola vista
- [ ] Usuario puede filtrar por texto/monto y el resultado impacta métricas/listados visibles
- [ ] Usuario puede descargar CSV del conjunto actualmente filtrado y abrirlo en Excel
- [ ] El CSV incluye headers consistentes y datos correctamente escapados
- [ ] Los errores de carga de PDFs no bloquean el procesamiento de archivos válidos
- [ ] La búsqueda responde de forma fluida sin degradación perceptible
