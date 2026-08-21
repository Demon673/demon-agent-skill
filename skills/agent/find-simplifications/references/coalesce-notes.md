# Coalescing superseded Agent Notes

Audit the Agent Note tree when the user asks to reduce or coalesce it, or when the simplification being implemented makes an owning note obsolete. Do not expand every code-simplification survey into a repository-wide note audit.

Use the repository's note-archiving skill, when it has one, for retention judgment and archive mechanics. Low-future-value implemented notes move as frozen triplets to the archive; proposed notes are never archived; rejected notes that no longer prevent a tempting mistake are deleted. Do not edit an archived note while simplifying current prose or code.

Follow the deletion rule in the Agent Note rules; do not duplicate or weaken it here. For each candidate chain:

1. Identify the current owner from shipped code, configuration, generated catalogs, package docs, newer Agent Notes, and inbound links; dates and titles are discovery hints, not proof.
2. Classify the old note as fully or partially superseded. Any surviving behavior, current contract, durable format, compatibility obligation, or independently current rejected alternative makes it partial. Rationale that can be transferred to the current owner does not by itself make supersession partial.
3. For full supersession, move every unique rationale, alternative, consequence, shipped verification evidence, and named coverage gap into the current owner. An inventory that only describes deleted implementation mechanics is not one of those decision facts.
4. Repair every inbound link, then delete the English note, its counterpart, and their consistency record together.
5. Search exact filenames, symbols, config keys, event names, and wire strings after the edit. Keep partial supersessions cross-linked and current.

An added-then-removed feature is a common full-supersession case. Let the removal note own the history only when the feature is absent from production code, configuration, schemas, durable or wire formats, migration, and compatibility behavior; no current documentation presents it as available; and no test exercises it as supported behavior. Removal rationale and tests that enforce absence may remain. Preserve why the feature originally existed, why that motivation no longer justified it, alternatives to full removal, the capability given up, conditions for reintroduction, and evidence that removal is complete. Old tests and implementation mechanics that verified only the deleted behavior are not current verification evidence.

Reject consolidation when the removal is only one transport, default, implementation, or presentation of a feature; when persisted data or compatibility handling survives; or when the removal note does not yet carry enough rationale to prevent accidental reintroduction. A current negative design decision may legitimately need its own note even though the removed implementation is gone.
