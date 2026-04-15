# Tasks: PDF Amount Reset

## Phase 1: Test-Driven Development (RED)

- [x] 1.1 Add failing test to `src/test/App.test.tsx`: "loads PDF B after PDF A → only PDF B transactions shown"
- [x] 1.2 Update existing tests in `src/test/App.test.tsx` that assert accumulation behavior (must assert replacement instead)
- [x] 1.3 Verify tests fail when running `npm run test`

## Phase 2: Core Fix (GREEN)

- [x] 2.1 Update `handleFiles` in `src/App.tsx` to replace `pdfStates` instead of appending
  - Replace `setPdfStates((prev) => [...prev, ...newPdfStates])` with `setPdfStates(newPdfStates)`
- [x] 2.2 Confirm `savePdfState(newPdfStates)` correctly persists only the most recent upload dataset
- [x] 2.3 Verify `clearPdfState` is not explicitly needed as replacement handles the reset naturally

## Phase 3: Verification (REFACTOR/VERIFY)

- [x] 3.1 Run `npm run test` and confirm all tests pass
- [x] 3.2 Manual check: load two files simultaneously and confirm they are both shown (multi-select test)
- [x] 3.3 Manual check: load a third file and confirm it replaces the previous two
- [x] 3.4 Confirm localStorage reflects only the last successful load after page refresh

## Phase 4: Verify Fixes (post-verification)

- [x] 4.1 Fix lint errors — remove unused `parseResults` and `categorizeResults` vars from test
- [x] 4.2 Add localStorage regression test — "localStorage only contains data from the last loaded PDF"
