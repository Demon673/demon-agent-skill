# Optional documentation hooks

The default template checks staged whitespace. Enable each documentation job only when its gate script, imported helpers, manifest, and runtime dependencies exist in the host repository. Run that gate successfully before merging its job into the existing `pre-commit.jobs` list; retain the host's other jobs. These gate assets are host-owned and are not shipped by setup.

For a host with the pairing gate, run `node scripts/verify-translation-pairing.mjs --check`, then add:

```yaml
- name: translation pairing (staged records)
  glob: '*.i18n.yaml'
  exclude:
    - '.agents/notes/archived/**'
  run: node scripts/verify-translation-pairing.mjs --check {staged_files}
```

For a host with the archive gate, run `node scripts/verify-archived-agent-notes.mjs`, then add:

```yaml
- name: archived agent notes
  glob: '.agents/notes/archived/**'
  run: node scripts/verify-archived-agent-notes.mjs
```

Activate the resulting configuration with `node scripts/install-lefthook.mjs`. In an isolated host fixture, stage a representative file for each enabled job and run `lefthook run pre-commit`; verify both a valid case and an invalid case before claiming the hook works.
