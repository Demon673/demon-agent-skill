# Few-shot leakage examples

Use these examples to identify the governing principle, not as text templates. This file deliberately quotes leaked wording as calibration material; the [recall batteries](recall-batteries.md) exclude this directory from repository scans.

## Dead citations

### Decision ordinal with a committed owner

**Leaked:** "Skill names flatten on install (decision 7)."

**Fixed:** "Skill names flatten on install — the flat-install rule owned by the skill-manifest documentation."

The ordinal resolves nowhere. If a committed owner exists, name it and link or cite its path where the surface supports one; later mentions may use the searchable name alone.

### Decision ordinal without an owner

**Leaked:** "The registry rejects duplicate names (decision 7: names are flat, no namespacing)."

**Fixed:** "The registry rejects duplicate names; names are flat, with no namespacing."

No committed artifact owns "decision 7", so the citation is deleted, but its factual clause survives as a standalone statement.

### Audit code or uncommitted draft section

**Leaked:** "Rendering is pure (audit R3), and layering follows `design v2 §3.2`."

**Fixed:** "Rendering is pure. The core layer has no I/O dependencies."

An audit code that exists only in the session and a section of an uncommitted draft resolve nowhere. External standards and committed documents that own their section numbering remain citable, such as "RFC 9110 §10.1.5".

### Plan-phase label

**Leaked:** "`src/client/` is the shell (T4); the P-I migration owns the adapters."

**Fixed:** "`src/client/` is the shell; the adapters live in `src/client/adapters/`."

Phase labels index a plan that did not ship. Replace the label with what the phase produced.

## PR and stack vantage

### Durable prose cannot see the stack

**Leaked:** "A future remote backend implements this interface (the local backend is a later PR in this stack)."

**Fixed:** "A remote backend can implement this interface without changing the render layer."

Keep the extension-point contract. The pending work belongs in the PR, a `TODO`, or an issue.

### "This PR" in a README

**Leaked:** "This PR adds cursor-based pagination to the session list."

**Fixed:** "The session list paginates by cursor."

A README outlives every PR; state the mechanism as current fact.

## Change narration and version stamps

### Fixed regression becomes present state

**Leaked:** "The validator used to skip the manifest; it no longer does."

**Fixed:** "The validator checks the plugin manifest against the discovered skill directories."

A correction is present behavior, not repository biography.

### Fixed regression keeps its guard

**Leaked:** "This used to double-encode multibyte labels."

**Fixed:** "Without the byte-length guard, multibyte labels double-encode."

Keep the regression pin as a present-tense counterfactual that names the guard.

### Removal narration and indexical stamps

**Leaked:** "Batch rendering is synchronous this cut; the async path is roadmap work."

**Fixed:** "Batch rendering is synchronous." Put the deferral in `TODO(batch-rendering): add the async path` at the owning call site.

Readers who never saw the deleted state learn nothing from "this cut", "v1", or "now" contrasted with a past release. Historical stage names inside an Agent Note's change-story section remain current-state evidence; the indexical form does not.

## Review choreography

### Review verdict as durable rationale

**Leaked:** "Rejected in review: caching the resolved spec. We keep resolution per call."

**Fixed in an Agent Note's Alternatives considered section:** "**Cache the resolved spec.** Rejected: the spec depends on per-call cwd, so a cache keyed only by request would serve stale roots."

The Alternatives-considered genre owns the rationale. The reviewer identity and review round do not.

### Draft ordinal in an implemented note

**Leaked:** "As of v5 of this note, the loader also validates manifests."

**Fixed:** "The loader validates manifests."

An implemented note states shipped reality; its revision history lives in version control.

## Reviewer-addressed justification

### Arguing a cast

**Leaked:** "The cast is safe — the SDK constructed the object, it simply doesn't declare the optionals strictly enough."

**Fixed:** "The SDK constructs this object with every optional populated; the declared type is looser than the runtime guarantee."

State the invariant a maintainer must preserve. "It simply…" answers an objection nobody at the repository head raised.

### Appeal to review authority

**Leaked:** "The pairing check is safe — it just compares presence because review approved it."

**Fixed:** "The pairing check compares presence and switcher lines; it cannot judge translation parity, which review owns."

State the actual bound. Correctness comes from an invariant, contract, or test, never a departed reviewer.

## Restatement and derivation

### Control-flow narration

**Leaked:** "First we normalize the label, then we truncate it, then we wrap it."

**Fixed:** Delete the comment when the following code already shows those steps. Keep only a non-obvious invariant or reason for their order.

### Test walkthrough

**Leaked:** "This test creates a session, sends two messages, waits for the second reply, and then asserts the log has four entries."

**Fixed:** "Two round-trips must produce exactly four log entries because the projection dedupes the shared prefix."

Keep the non-obvious assertion rationale; delete the walkthrough that restates the test body.

## Hedges and planning residue

### Unmarked deferral

**Leaked:** "Probably fine to render eagerly for now."

**Fixed:** Delete the hedge. If deferral is intentional, write `TODO(owner): coalesce rendering per animation frame` at the owning location.

### Vague sizing

**Leaked:** "A 64 KiB buffer should be enough for most cases."

**Fixed:** "64 KiB holds the largest observed frame (48 KiB) with headroom; a larger frame fails loudly in `decode`."

Replace the hedge with the actual bound and its failure behavior.

## Authoring-language slips

**Leaked:** "The renderer runs on the client 端; see the 设计稿 for spacing. ---- 私有 ----"

**Fixed:** "The renderer runs on the client side; spacing follows the Figma frame `badges`."

Working-language fragments and session separators are transcription residue. A named external source such as a Figma frame remains valid because it resolves outside the repository.

### Authoring-language slip inside a paired fence

**Leaked in both files:** `// 更新这里 before returning` inside a verbatim code block.

**Fixed in both files:** `// Update this before returning.`

Correct the block once and copy that byte-exact fence into both language files. Divergent code comments break the pairing contract even when each comment is fluent.

## Behavior-visible candidates

**Suspect:** An exported JSDoc sentence says "available for now", and a generator copies it into a model-visible catalog.

**Wrong:** Rewrite only the source sentence during a prose-only purge, or hand-edit only the generated catalog.

**Right:** Trace the source's consumers, update the owner, regenerate every derivative, and update the owning runnable scenario. If the authorized scope has no owning scenario, leave the wording unchanged and report the deferral.

## Keeps

### Issue references are durable on every surface

**Keep:** "The cap applies to the complete rendered value, wrappers included (issue #1470 owns the follow-up)."

Issues resolve at the repository head from any surface. Agent Notes and postmortems additionally sanction merged-PR citations as evidence.

### Dead name-drops are not ownership

**Delete:** "Badge renderer over the widget seam (see the widget-rendering RFC)."

No committed file answers to "the widget-rendering RFC". Retarget the pointer to a resolvable owner or delete it.

### Suppression justifications

**Keep after fixing:** `// lint-disable-next-line no-non-null-assertion -- the one-element literal guarantees index 0.`

The justification is required prose. If its reason is false, replace the reason with the invariant; do not delete the justification.

### Measured bounds

**Keep:** "Depth cap: 512 nested values, measured at about 0.15 seconds; 4096 blocks the event loop."

The measurement pins the constant against uninformed retuning, and "measured" identifies evidence rather than a guess.

### Runtime language is not repository history

**Keep:** "The old connection drains before the new one accepts."

Here "old" and "new" name two live runtime objects during handover. The change-narration ban applies to repository states, not lifecycle vocabulary.

### Runtime natural time is not a version stamp

**Keep:** "What is today's date?"

The prompt asks about the runtime clock. Because this text reaches a model or user, any rewrite still requires its owning behavior evidence.

## Overcorrection traps

Enumerate a passage's propositions before trimming it. Every trap below changes meaning while making the sentence shorter.

### Flipping an obligation into an endorsement

**Original:** "These direct registrations are exceptions pending migration to the registry."

**Overcorrected:** "These direct registrations are sanctioned exceptions."

**Right:** "These direct registrations are exceptions pending migration to the registry."

"Pending migration" is an obligation; "sanctioned" blesses the current state.

### Promoting a hypothetical to a shipped feature

**Original:** "A future IPC-based shell would subclass the executor and override `spawn`."

**Overcorrected:** "An IPC-based shell subclasses the executor and overrides `spawn`."

**Right:** "A hypothetical IPC-based shell, which does not exist, would subclass the executor and override `spawn`."

Deleting the future marker turns a design illustration into a claim that the class ships.

### Deleting a true fact with the transcript around it

**Original:** "The notice narrates the check order; its text is also what the notification validator compiles against."

**Overcorrected:** Delete the whole sentence as narration.

**Right:** "The notice text is what the notification validator compiles against."

Delete the narrative clause and preserve the load-bearing coupling.

### Dropping the measurement source while keeping the number

**Original:** "The 4 MiB ceiling is measured: the largest generated type module is 3.1 MiB."

**Overcorrected:** "The ceiling is 4 MiB; the largest generated type module is 3.1 MiB."

**Right:** Keep "measured". Without it, the observation reads as a definition and invites retuning without evidence.
