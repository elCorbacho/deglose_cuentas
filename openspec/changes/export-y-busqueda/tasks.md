# Tasks: export-y-busqueda

## Phase 1: lib layer (pure logic, no UI)

- [x] 1.1 Add `mergeTransactions(txs: PersistedTransaction[][]): PersistedTransaction[]` to `src/lib/aggregator.ts` — flatten array of arrays; serves as base for multi-PDF consolidation.
- [x] 1.2 Create `src/lib/csvExporter.ts` with `exportToCsv(transactions: PersistedTransaction[]): void` — generates UTF-8 BOM CSV, escapes commas/quotes/newlines, triggers browser download via Blob + URL.createObjectURL.
- [x] 1.3 Create `src/lib/search.ts` with `filterTransactions(transactions: PersistedTransaction[], term: string): PersistedTransaction[]` — case-insensitive search across comercio + description; parses "$1.250" → 1250 for monto matching; escapes regex special chars; trims whitespace.

## Phase 2: component layer (UI atoms/molecules)

- [x] 2.1 Create `src/components/atoms/ExportButton.tsx` — receives `onClick` handler and `disabled` prop; has `aria-label`, keyboard tabindex; disabled state shows tooltip "No hay datos para exportar".
- [x] 2.2 Create `src/components/molecules/SearchBar.tsx` — controlled input with `aria-label="Buscar transacciones por comercio, descripción o monto"`; emits `onSearch(term: string)`; shows clear (×) button when term.length > 0.

## Phase 3: integration (wiring)

- [x] 3.1 Refactor `src/App.tsx` — change `rawTransactions` state from single array to `pdfStates: PdfState[]` (each entry: `{ id: string, fileName: string, transactions: PersistedTransaction[] }`); add `allTransactions` derived via `useMemo(mergeTransactions)` from pdfStates.
- [x] 3.2 Update `src/components/organisms/FileUpload.tsx` — change `accept` to `"application/pdf"` (already); support multiple files via `multiple` attribute; validate PDF type and max 10 files limit; call `onFileLoaded` (now `onFilesLoaded(File[])`) for each file sequentially; expose per-file error messages with `role="alert"`.
- [x] 3.3 Update `src/components/organisms/Dashboard.tsx` — receive `allTransactions` and `searchTerm` + `onSearch` from parent; apply `useMemo` filter; pass filtered transactions to CategoryList; render `SearchBar` and `ExportButton`; show "No se encontraron transacciones" empty state with clear-search button when filter returns 0 results.
- [x] 3.4 Update `src/components/organisms/CategoryList.tsx` — no changes needed; categories are derived from filtered transactions in App.tsx and passed as already-grouped props.

## Phase 4: tests (strict TDD — test-first)

- [x] 4.1 Write `src/test/csvExporter.test.ts` — test UTF-8 BOM presence, field escaping (commas, quotes, newlines), correct column headers (fecha, comercio, monto, categoria), empty/null field handling, download trigger.
- [x] 4.2 Write `src/test/search.test.ts` — test commerce match, monto match (with/without $ prefix), special regex chars (.\*+?), whitespace-only term returns all, no-results term returns [], case insensitivity.
- [x] 4.3 Write `src/test/aggregator.test.ts` — add `mergeTransactions` test cases: merges 2+ arrays, handles empty arrays, deduplication NOT required (design decision: duplicates visible).
- [x] 4.4 Write `src/test/SearchBar.test.tsx` — test controlled input, emits onSearch on change, clear button visible when term present, clear button resets term and emits empty search.
- [x] 4.5 Write `src/test/ExportButton.test.tsx` — test disabled state, enabled state, click handler called, `aria-label` present.
- [x] 4.6 Write `src/test/FileUpload.test.tsx` — update for multi-file: test multiple file selection, 10-file limit rejection, partial-error scenario (one invalid + others valid), `role="alert"` on error message.

## Phase 5: Critical fixes (from sdd-verify)

- [x] 5.1 CRITICAL 1: Add empty state in `Dashboard.tsx` — show "No se encontraron transacciones" + "Limpiar búsqueda" button when `searchTerm.trim() !== ''` AND `filteredForExport.length === 0`; button calls `onSearch("")`.
- [x] 5.2 CRITICAL 2: Fix search pipeline in `App.tsx` — add `searchFilteredTransactions` useMemo applying `filterTransactions(filteredTransactions, searchTerm)`; pass to `group()` so categories/grandTotal reflect search; update `transactionCount` in Dashboard to use `searchFilteredTransactions.length`.
- [x] 5.3 CRITICAL 3: Fix TypeScript errors — add `transactions` field to CategoryGroup test data in Dashboard.test.tsx; add `color?: string` to CategoryJson type; fix csvExporter.test.ts mock types; remove `asChild` from ExportButton's TooltipTrigger.
- [x] 5.4 CRITICAL 3 (lint): Fix lint violations — prefix unused `handleFile` with `_`; refactor PDF state restoration from `useEffect` to lazy `useState` initializer to fix `react-hooks/set-state-in-effect`.
- [x] 5.5 WARNING: Fix monto matching — change `===` to `.includes()` in `src/lib/search.ts` for substring-based amount search; add tests for partial amount matching.
- [x] 5.6 Write `src/test/Dashboard.test.tsx` — test empty state behavior (message, button, onSearch call, no false positives).
