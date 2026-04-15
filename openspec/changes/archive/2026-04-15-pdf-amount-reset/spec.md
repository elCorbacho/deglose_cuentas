# Delta Spec: PDF Amount Reset

## ADDED Requirements

### Requirement: REQ-1 PDF State Replacement

The system MUST replace `pdfStates` entirely when a new successful PDF load occurs, and MUST discard all previously loaded PDF state.

#### Scenario: Load single PDF -> shows correct totals

- GIVEN no active PDF state
- WHEN the user loads one valid PDF
- THEN `pdfStates` contains only transactions from that PDF
- AND prior state is not retained

#### Scenario: Load PDF A then PDF B -> only PDF B remains

- GIVEN PDF A has been loaded and analyzed
- WHEN the user loads PDF B in a later, separate load action
- THEN `pdfStates` is replaced with PDF B data only
- AND no transaction from PDF A remains in memory

### Requirement: REQ-2 LocalStorage Reset on Load

After successful PDF processing, the system MUST call `savePdfState` with ONLY transactions from the current load, and persisted state MUST NOT include transactions from prior loads.

#### Scenario: Load PDF -> reload page -> same dataset restored

- GIVEN a PDF was loaded successfully
- WHEN the page reloads and persisted state is restored
- THEN restored transactions match only the most recent successful load
- AND restored data excludes any earlier, replaced load

### Requirement: REQ-3 Total Amount Accuracy

When analysis renders after a load, all totals (monto total and per-category amounts) MUST reflect only transactions in the current active dataset.

#### Scenario: Analysis totals after replacement load

- GIVEN PDF A was loaded, then replaced by PDF B
- WHEN the analysis view renders after loading PDF B
- THEN monto total equals the sum of PDF B transactions only
- AND each category amount equals sums from PDF B only

### Requirement: REQ-4 Regression Update for Existing Tests

Any existing automated test that previously asserted accumulation across separate loads MUST be updated to assert replacement behavior.

#### Scenario: Existing accumulation tests are migrated

- GIVEN a test that expected totals to include prior uploads
- WHEN the test suite is updated for this change
- THEN assertions validate replacement semantics across separate loads
- AND no test enforces cross-load accumulation

### Requirement: REQ-5 Multi-Select Combination in Single Load

The system MAY combine transactions from multiple PDFs selected in one upload action, but MUST treat that combined set as one active dataset that is replaced by any later load action.

#### Scenario: Load PDF A + PDF B simultaneously

- GIVEN the user selects PDF A and PDF B in one file-picker action
- WHEN processing completes successfully
- THEN analysis totals equal the combined transactions from A and B for that single load
- AND a later separate load replaces this combined dataset entirely
