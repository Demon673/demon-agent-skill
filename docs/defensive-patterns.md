# Defensive patterns

English | [中文](defensive-patterns.zh.md)

Hard-won bug-class rules: each pattern below is a class of defect that actually shipped or nearly shipped in the harness this documentation descends from, stated as the rule that prevents its recurrence. Read this before writing lifecycle, concurrency, subprocess, or teardown code.

## Report orthogonal outcomes independently

A result can be several things at once — a process can time out AND exit 0 because it trapped the signal. Surface each independent fact (`timedOut`, `signal`, `exitCode`) on its own; never nest one flag's report inside another's branch, or a caller reads a cut-short run as a clean success.

## Honor public contracts on BOTH sides

When an implementation receives several representations of one outcome, normalize them before returning through the public API. A stream may throw or emit a terminal `finish` event; expose failures through one documented form and exercise every source form through the real consumer, so callers never guess whether a caught exception came from the provider, a wrapper, logging, or their own assembly.

## Async state is not synchronous state

A request that has not completed has not completed: a background job's completion races turn boundaries; a close callback fires for both end-of-input and teardown. Never gate control flow on a state you only just requested — drive lifecycle off the events or promises that actually fire, observe the transition (saw `running` THEN `idle`), and handle the "nothing to wait for" branch explicitly, because an awaited transition that can never occur hangs.

## Dispose must reach quiescence, not just request it

A teardown that issues kills or aborts but returns before the work stops leaves orphans. Make cleanup async and await the children's exit (kill → await `done`), and close listener or notification registries BEFORE killing so late completions stay silent. Tests prove disposal waited, not merely that the process eventually dies.

## Contain callback exceptions in the dispatcher

A user-supplied listener that throws must not reject the promise it runs inside or starve the listeners after it. Wrap the dispatch loop in try/catch and log; one bad subscriber never breaks core lifecycle.

## Never hand untrusted output the ambient environment or predictable paths

Spawned commands get a scrubbed env (drop `*KEY*` / `*SECRET*` / `*TOKEN*` / `*PASSWORD*`) so credentials cannot leak into output, `env`, or spill files. Temp and spill files use a private (0700) dir, random names, and exclusive owner-only opens — predictable world-readable paths invite symlink races and disclosure.

## Unlink link-shaped paths

A path that may be a symlink or junction is removed by checking `lstat` first, then unlinking: unlink deletes only the link and refuses a real directory, so it never follows the link into its target. Reserve recursive deletion for known real directories.
