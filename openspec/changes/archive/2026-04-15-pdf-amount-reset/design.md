# Design: PDF Amount Reset

## Technical Approach

The core issue lies in `src/App.tsx` within the `handleFiles` function. When a new PDF (or multiple PDFs in a single selection) is loaded, the state update incorrectly appends the new results to the existing `pdfStates` using a functional update (`prev => [...prev, ...newPdfStates]`).

To satisfy the spec (REQ-1, REQ-2, REQ-3, and REQ-5), we must change this to a direct state replacement. When the user performs an upload action, the resulting parsed data (`newPdfStates`) should _replace_ the active state entirely. Because `handleFiles` already processes all files from a single upload action into the `newPdfStates` array, replacing the state handles both single-file and multi-file uploads correctly (REQ-5).

## Architecture Decisions

### Decision: State Update Strategy in `handleFiles`

**Choice**: Use direct state replacement: `setPdfStates(newPdfStates)`.
**Alternatives considered**: Keep functional update but conditionally clear it based on a flag.
**Rationale**: Direct replacement is exactly what the spec requires. When a user uploads a file or multiple files, that action defines the new working dataset. Keeping the functional update adds unnecessary complexity since we explicitly _want_ to discard `prev`.

### Decision: LocalStorage Persistence Contract

**Choice**: Call `savePdfState` with the exact contents of `newPdfStates`.
**Alternatives considered**: Save inside a `useEffect` watching `pdfStates`.
**Rationale**: `savePdfState` is already called imperatively inside `handleFiles`. We will simply update that imperative call to use `newPdfStates` directly instead of the accumulated `updated` array. This ensures localStorage exactly matches the new state (REQ-2).

## File Changes

### 1. `src/App.tsx` (Bug Fix)

**Action**: Modify

**Description**:
Change the state update inside `handleFiles` (lines 156-165).

_Old Code:_

```typescript
if (newPdfStates.length > 0) {
  setPdfStates((prev) => {
    const updated = [...prev, ...newPdfStates]; // accumulates
    savePdfState({
      rawTransactions: updated.flatMap((s) => s.transactions),
      fileName: updated[0].fileName,
    });
    return updated;
  });
  setActiveView('analysis');
}
```

_New Code:_

```typescript
if (newPdfStates.length > 0) {
  setPdfStates(newPdfStates); // replace entirely
  savePdfState({
    rawTransactions: newPdfStates.flatMap((s) => s.transactions),
    fileName: newPdfStates[0].fileName, // Or a combined name if preferred, but existing logic used index 0
  });
  setActiveView('analysis');
}
```

### 2. `src/test/App.test.tsx` (Test Updates)

**Action**: Modify

**Description**:
Locate tests that assert accumulation (e.g., "loads multiple PDFs and accumulates totals" or similar). Update these tests to assert _replacement_ behavior instead (REQ-4).

- If a test loads PDF A, then loads PDF B in a separate action, it must assert that only PDF B's totals are shown.
- If a test exists for multi-select (loading A and B in the _same_ action), ensure it still passes (this verifies REQ-5).

## Edge Cases Addressed

1. **Multi-select (loading 2 PDFs simultaneously):** The file picker returns a `FileList` of length 2. `handleFiles` processes both into the `newPdfStates` array (length 2). Direct replacement `setPdfStates(newPdfStates)` correctly sets the state to contain both PDFs.
2. **Sequential loads (PDF A, then PDF B):** Uploading PDF A sets state to `[PDF_A]`. A subsequent upload of PDF B creates a new `newPdfStates` array `[PDF_B]`. Direct replacement correctly discards PDF A and sets state to `[PDF_B]`.

## Testing Strategy

| Layer       | What to Test         | Approach                                                                                       |
| ----------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| Integration | Sequential Uploads   | Render `<App />`, upload PDF A, verify totals. Upload PDF B, verify totals match _only_ PDF B. |
| Integration | Multi-select Uploads | Render `<App />`, upload PDF A and PDF B simultaneously, verify totals match A + B.            |
| Integration | LocalStorage Sync    | Upload PDF A, then PDF B. Assert `localStorage.getItem` only contains data from PDF B.         |

## Migration / Rollout

No data migration required. The next upload action by any user will naturally replace their state and fix any corrupted (accumulated) local storage they might have.

## Open Questions

- None. The fix is a precise replacement of the state update logic.
