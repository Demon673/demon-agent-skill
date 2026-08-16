# Few-shot leakage examples

Use them to identify the governing principle, not as text templates. This file deliberately quotes leaked wording as calibration material.

## Dead citations

### Decision ordinal with a committed owner

**Leaked:** "Skill names flatten on install (decision 7)."

**Fixed:** "Skill names flatten on install — see the [Agent Note rules](../../../../.agents/notes/README.md#layout-and-naming)."

The ordinal resolves nowhere; the owning doc's name and path do.

## Change narration

**Leaked:** "The validator used to skip the manifest; it no longer does."

**Fixed:** "The validator checks the plugin manifest against the discovered skill directories."

A fixed regression becomes present state, not repo history.

## Reviewer-addressed justification

**Leaked:** "The pairing check is safe — it just compares presence."

**Fixed:** "The pairing check compares presence and switcher lines only; it cannot judge translation parity, which review owns."

State the actual bound; the "it just" is an argument to a departed reviewer.

## Hedges

**Leaked:** "The description length is probably fine for now."

**Fixed:** "Keep descriptions under 1024 characters."

Promote the hedge to a real bound or delete it.

## Overcorrection traps

Before deleting, confirm the edit does not:

- flip an obligation into an endorsement ("pairs update together" → "you may update the counterpart"),
- promote a hypothetical to a shipped fact,
- delete a true fact ("review owns parity" is a limit, not noise),
- drop provenance ("measured" bounds, issue numbers, suppression reasons).
