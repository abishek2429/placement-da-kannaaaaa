---

### 2. `reflection.md`

# Reflections — Mission Deloitte 2: Dynamic JSON-Driven Form Generator

## What I actually built vs. what I thought I was building

Going in, I read this as "make a form that reads JSON and renders inputs."
That's the easy 20% of the task. The real problem was in the other 80%:
how do you make **validation** and **show/hide logic** also schema-driven,
so that "age > 18" and "if Employed, show Company Name" never turn into
hardcoded `if` statements buried in a component somewhere? Once I reframed
it that way, the design became about drawing clean boundaries between three
things that are usually tangled together in a form component: what a field
*looks like*, whether it's *visible*, and whether it's *valid*.

## Biggest technical takeaway: separation of concerns isn't just a buzzword here

I could have written one big component that did rendering + validation +
conditional checks all inline per field. It would have worked for this one
schema. But the moment I imagined a second client questionnaire with
different rules, that approach would mean copy-pasting a form and hand-editing
`if` conditions — which is exactly the maintenance cost a consulting firm
serving many clients can't afford. Splitting into a field registry (type →
renderer), a conditional engine (visibility), and a validation engine
(correctness) meant a brand-new client questionnaire is *just a JSON file*.
That's the difference between "a form" and "a form generator."

## Big-O thinking outside of DSA problems

I'm used to thinking about Big-O for LeetCode-style problems, not for
day-to-day app code. This task forced me to actually reason about it in a
practical context: is validating the whole form on every keystroke fine, or
does it need per-field dirty-tracking? For a form with tens of fields, O(N)
per keystroke is genuinely fine — but I had to justify that with numbers
instead of assuming "React re-renders are always cheap." Writing that
trade-off down in the README made me more honest about it than if I'd just
shipped the code and moved on.

## The "fail-safe" decision I almost didn't make

Originally my conditional engine defaulted to *showing* a field if it hit an
operator it didn't recognize. Writing the tests made me stop and ask: for a
compliance/consulting questionnaire, is it worse to hide a field that should
be shown, or show one that should be hidden? Hiding-by-default is the safer
failure mode — an unclear rule shouldn't accidentally expose a field that
was supposed to be gated. That's a small line of code, but it's the kind of
decision an interviewer or reviewer actually cares about, more than the
happy-path logic.

## Edge cases taught me more than the main logic did

Writing `age exactly 18 fails` as a test made me actually reread the
requirement ("age > 18") instead of assuming ">=". Same with the
whitespace-only string case — an empty-looking input that technically isn't
`""`. None of that shows up if you only test the happy path. Writing tests
*before* writing the README also meant I wasn't documenting behavior I
assumed was true — I was documenting behavior I'd verified.

## What I'd do differently next time

- Write the edge-case tests *before* the implementation, not after — I got
  lucky that my first pass matched the tests I later wrote.
- Think about schema versioning earlier. Right now if a client's
  questionnaire schema changes mid-engagement, an in-progress submission
  has nowhere good to go.
- Push harder on where the O(N) re-validation would actually start to hurt,
  and what the fix looks like, instead of just asserting it wouldn't matter.

## One-line summary

The task looked like a forms exercise and was really a lesson in keeping
data (schema) and logic (engines) separate enough that adding a new rule
never means touching a component file.
