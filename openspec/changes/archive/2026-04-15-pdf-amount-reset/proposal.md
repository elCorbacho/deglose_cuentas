# Proposal: PDF amount reset

## Intent

Fix a state bug where loading a new PDF keeps prior transactions in memory and in localStorage, causing totals to accumulate across uploads and after reload. Users must see only the currently loaded PDF data.

## Scope

### In Scope

- Update `src/App.tsx` so a new PDF load replaces `pdfStates` instead of appending to prior state.
- Ensure `src/services/pdfState.ts` persistence stores only the latest upload snapshot.
- Add/update tests in `src/test/App.test.tsx` and `src/test/pdfState.test.ts` for replacement behavior.

### Out of Scope

- Any UX or copy changes in the upload/analysis flow.
- Support for simultaneous multi-PDF accumulation as a product feature.

## Capabilities

### New Capabilities

- `pdf-upload-session`: each upload defines the active in-memory dataset for analysis.
- `pdf-state-persistence`: persisted PDF state mirrors only the active upload, not historical uploads.

### Modified Capabilities

- None (no base specs exist in `openspec/specs/`).

## Approach

Replace the accumulation update path with direct replacement: `setPdfStates(newPdfStates)`. Persist `newPdfStates.flatMap(...)` instead of any merged array so reloads hydrate the same single-upload snapshot.

## Affected Areas

| Area                        | Impact   | Description                                                 |
| --------------------------- | -------- | ----------------------------------------------------------- |
| `src/App.tsx`               | Modified | Replace append logic with overwrite on successful PDF load  |
| `src/services/pdfState.ts`  | Modified | Preserve only current upload data in storage contract/usage |
| `src/test/App.test.tsx`     | Modified | Cover repeated uploads resetting totals                     |
| `src/test/pdfState.test.ts` | Modified | Cover persisted state reflecting latest upload only         |

## Risks

| Risk                                             | Likelihood | Mitigation                                                      |
| ------------------------------------------------ | ---------- | --------------------------------------------------------------- |
| Existing tests rely on old accumulation behavior | Med        | Update assertions to reflect single-upload replacement contract |

## Rollback Plan

Revert the `src/App.tsx` upload-state assignment and related test updates, restoring prior append behavior if replacement causes regression.

## Dependencies

- None.

## Success Criteria

- [ ] Uploading a second PDF shows totals from that PDF only.
- [ ] Reloading after a second upload restores only the latest PDF data.
- [ ] Automated tests protect against reintroducing accumulation.
