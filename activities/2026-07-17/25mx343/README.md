# Dynamic JSON-Driven Form Generator — Deloitte USI Technical Challenge

A React/Next.js engine that renders a nested consulting-client questionnaire entirely from a JSON schema — including field-level validation and conditional (if/then) field visibility — with no hardcoded form markup.

## Architecture

**Design principle: separate "what the form looks like" (schema) from "how a field type renders" (registry) from "whether a field is visible/valid" (the two engines).** None of these three layers knows about the others' internals, which is what makes the form "dynamic" rather than just data-configured HTML.

### 1. Schema shape

Each field carries:
- `type` — which renderer to use (text, number, select, checkbox, multiselect, date, textarea)
- `validation` — a bag of declarative rules (required, min, max, minLength, maxLength, pattern, minItems)
- `conditional` (optional) — `{ dependsOn, operator, value }`, e.g. companyName depends on employed === true

This means the `age > 18` rule and the `Employed → Company Name` rule are both just data in `questionnaire.schema.json` — no `if (field.id === "age")` branch exists anywhere in the codebase. A new client questionnaire is a new JSON file, not a new component.

### 2. Conditional logic engine (`lib/conditionalLogic.js`)

`isFieldVisible(field, values)` reads only the single `dependsOn` field's current value out of a flat `values` map — a hash lookup, not a schema re-scan. Supported operators (`equals`, `notEquals`, `includes`, `truthy`) are a deliberately small closed set rather than a generic expression parser (see Trade-offs).

An unrecognized operator fails safe by hiding the field, rather than defaulting to visible — for a compliance questionnaire, an ambiguous rule should never accidentally expose a field that should have been gated.

### 3. Validation engine (`lib/validation.js`)

`validateField` checks a fixed set of possible rule keys, in a fixed order, short-circuiting on the first failure. `validateForm` calls `getVisibleFields` first and validates only those — a field hidden by conditional logic is never required. That's what lets "if Employed, show Company Name" and "Company Name is required" compose correctly: toggling Employed off makes Company Name disappear and stop blocking submission, automatically, with no special-case code linking those two fields beyond the schema itself.

### 4. Field registry (`components/fieldRegistry.jsx`)

A plain object mapping `type → render function`, looked up once per field by `DynamicForm`. Adding a new input type (e.g. radio, file) means adding one entry here — `DynamicForm.jsx` itself never changes.

### 5. DynamicForm component

Holds one flat `values` state object keyed by field id (not nested by section). Flat state means a field's visibility/validation never has to know which section it lives in, and adding/removing sections doesn't change how state is shaped.

## Handling Nesting

The schema nests two levels (`sections → fields`) which covers the stated requirement. The engines don't assume that depth, though: `conditional` resolves against the flat `values` map regardless of which section the dependency field lives in, so a field in Section 3 can depend on a field in Section 1 with no extra plumbing. Deeper nesting (fields containing sub-fields) would need `DynamicForm` to recurse into a field's own `fields` array — the two engines already operate value-map-first, so that extension doesn't require touching them, only the renderer.

## Big-O Trade-offs

| Operation | Complexity | Why |
| ------ | ------ | ------ |
| `isFieldVisible(field, values)` | O(1) | one hash lookup on `values[dependsOn]` |
| `getVisibleFields(schema, values)` | O(N) | N = total field count across all sections, one pass |
| `validateField(field, value)` | O(1) | fixed number of rule checks (bounded by rule set size, not N) |
| `validateForm(schema, values)` | O(N) | validates only currently-visible fields, one pass |
| Field type lookup (`FIELD_REGISTRY[type]`) | O(1) | object key access |
| Re-render on keystroke | O(N) | `useMemo` reruns `validateForm` over all visible fields on every value change |

The one deliberate trade-off worth calling out: `validateForm` re-runs across all visible fields on every keystroke (via `useMemo` keyed on `values`), not just the field that changed. For the questionnaire sizes a consulting intake form actually has (tens of fields, not thousands), O(N) per keystroke is imperceptible and keeps the code simple — there's no per-field dirty-tracking to get wrong. If this needed to scale to a schema with hundreds of fields and validation got expensive (e.g. an async pattern check hitting an API), the fix would be to validate only the changed field plus any fields whose `conditional.dependsOn` matches it — still findable in O(1) by walking the changed field's dependents.

Why a closed operator set instead of a generic expression engine: A generic eval-style condition parser would support arbitrary logic but introduces its own class of bugs and a security surface (arbitrary expressions from a schema that might come from an external client). Four explicit operators cover every case in the given problem statement (equals/notEquals/includes/truthy) and are trivial to unit test exhaustively — trading some flexibility for predictability.

Why a flat `values` map instead of `values` nested by section: Nesting by section would make `dependsOn` ambiguous (is it a sibling field, or a field in another section?) and turn every lookup into an O(sections) search. A flat map keeps every lookup O(1) and lets a field depend on any other field regardless of section, at the cost of field ids needing to be globally unique within a schema — an acceptable constraint for a questionnaire.

## Edge Cases Covered (see `tests/logic.test.mjs`)

- Age exactly 18 fails (min: 18 is exclusive — age must be greater than 18, not merely 18 or older, per the "age > 18" requirement)
- Negative age fails
- Required field rejects both an empty string and a whitespace-only string
- Optional field with no value is not additionally checked against min/max/pattern rules (an empty optional field isn't a "too short" string)
- Nested conditional dependency: `contractEndDate` only appears when `employmentType === "Contract"`, which itself only appears when `employed === true` — a two-level conditional chain
- `includes` operator for multiselect-driven visibility (`riskDetails` only shows when "Risk & Compliance" is one of several selected services)
- Unknown/malformed `operator` value hides the field rather than showing it
- Full-form validation confirms a hidden field never blocks submission, and immediately starts blocking submission the moment its dependency makes it visible

## What I'd Add With More Time

- Per-field async validation (e.g. server-side uniqueness checks) with a loading state per field
- Schema versioning/migration so an in-progress submission survives a schema update
- A JSON Schema-based validator for the schema file itself, so a malformed client questionnaire fails fast at authoring time rather than at render time
