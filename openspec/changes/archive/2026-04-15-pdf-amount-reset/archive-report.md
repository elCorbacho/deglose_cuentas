# Archive Report: pdf-amount-reset

**Change**: pdf-amount-reset  
**Archived**: 2026-04-15  
**Artifact store**: engram + openspec (hybrid)  
**Engram observation IDs**: #808, #810, #811, #813, #814, #815

---

## Change Summary

### What Was Fixed

Fixed a state management bug where loading a new PDF appended transactions to existing state instead of replacing it, causing incorrect totals to accumulate across uploads.

### Why It Mattered

Users loading multiple PDFs in sequence saw combined totals instead of the current PDF's data. Reloading the page would restore accumulated data rather than the latest upload.

### The Root Cause

The `handleFiles` function in `src/App.tsx` used the functional update form `setPdfStates(prev => [...prev, ...newPdfStates])`, which always appended to existing state.

### The Solution

Replaced with direct replacement: `setPdfStates(newPdfStates)`. This correctly handles multi-select (multiple files in one upload action combine) while enforcing replacement on sequential uploads.

---

## Requirements Addressed

| ID    | Requirement                             | Status                  |
| ----- | --------------------------------------- | ----------------------- |
| REQ-1 | PDF State Replacement                   | ✅ IMPLEMENTED          |
| REQ-2 | LocalStorage Reset on Load              | ✅ IMPLEMENTED + TESTED |
| REQ-3 | Total Amount Accuracy                   | ✅ IMPLEMENTED          |
| REQ-4 | Regression Update for Existing Tests    | ✅ COMPLETED            |
| REQ-5 | Multi-Select Combination in Single Load | ✅ IMPLEMENTED + TESTED |

---

## Files Changed

### Source Files

| File                    | Change                                                 | Lines    |
| ----------------------- | ------------------------------------------------------ | -------- |
| `src/App.tsx`           | Replaced append logic with direct replacement          | 156-165  |
| `src/test/App.test.tsx` | Added replacement tests + localStorage regression test | +3 tests |

### OpenSpec Artifacts

| Artifact            | Engram ID |
| ------------------- | --------- |
| `proposal.md`       | #808      |
| `spec.md`           | #810      |
| `design.md`         | #811      |
| `tasks.md`          | #813      |
| `apply-progress.md` | #814      |
| `verify-report.md`  | #815      |

---

## Test Results

```
Test Files  9 passed (9)
     Tests  92 passed (92)
  Duration  9.19s

Warnings: 5 (jsdom scrollTo not implemented - benign)
```

### New Tests Added

1. **Sequential upload replacement**: "loads PDF B after PDF A → only PDF B transactions shown (no accumulation)"
2. **Multi-select combination**: "multi-select in single upload action combines PDFs"
3. **LocalStorage regression**: "localStorage only contains data from the last loaded PDF"

---

## Verification Summary

| Check               | Result                                    |
| ------------------- | ----------------------------------------- |
| Spec compliance     | ✅ All 5 requirements implemented         |
| Test coverage       | ✅ 92/92 tests passing                    |
| Lint                | ✅ 0 errors, 0 warnings                   |
| TDD process         | ✅ RED-GREEN-REFACTOR followed            |
| Manual verification | ✅ Multi-select and replacement confirmed |

**Verification Verdict**: PASS

---

## Key Learnings

1. **Functional state updates are dangerous for replacement semantics**: `setPdfStates(prev => [...prev, ...new])` always appends, regardless of intent.

2. **Direct replacement handles multi-select correctly**: `newPdfStates` is already an array of all files from one upload action, so `setPdfStates(newPdfStates)` combines them while still replacing prior state.

3. **Testing localStorage requires mocking**: Use `vi.spyOn(Storage.prototype, 'setItem')` to verify persistence behavior without actual storage operations.

4. **getByText vs getAllByText**: When the same value appears in multiple elements (total in card AND category span), use `getAllByText` with `.toHaveLength()` check.

5. **Unused lambda params require `_` prefix**: ESLint `@typescript-eslint/no-unused-vars` requires unused parameters to be prefixed with `_`.

---

## Archive Location

**Primary (Engram)**: All artifacts saved to Engram with observation IDs for traceability.

**Secondary (OpenSpec)**:

- Original change folder: `openspec/changes/pdf-amount-reset/`
- Archived folder: `openspec/changes/archive/2026-04-15-pdf-amount-reset/`

---

## SDD Cycle Complete

This change has been fully executed through the Spec-Driven Development cycle:

1. ✅ **Proposal** - Intent, scope, and approach defined
2. ✅ **Spec** - 5 requirements with scenarios documented
3. ✅ **Design** - Technical approach documented
4. ✅ **Tasks** - 10 tasks across 4 phases completed
5. ✅ **Apply** - Implementation completed
6. ✅ **Verify** - All requirements validated, 92 tests passing
7. ✅ **Archive** - Delta specs synced, change archived

**Ready for the next change.**
