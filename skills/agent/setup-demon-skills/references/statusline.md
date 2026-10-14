# Optional Claude Code status line

Load this reference only when the agent running setup is Claude Code and the user is considering its optional status line. Installed Claude skills or a `.claude/` directory alone do not establish the current runtime. Other runtimes skip this step.

## Offer and scope

Offer a two-row status line: directory, model and live effort, and session name on the first row; a twenty-cell context usage bar enclosed in brackets, percentage, capacity and estimated tokens remaining, cumulative running-session duration, and available quota data on the second. The five-hour quota includes percentage remaining and a reset countdown when supplied; the weekly quota shows percentage remaining. Unavailable fields without a retained measurement and expired quota windows are omitted. The bar uses `█` for filled cells and dimmed `░` for empty cells. The entire Context segment uses one color that changes continuously with usage: light green at 0%, dark yellow at 70%, and red at 100%. The empty track remains neutral and dimmed. This 24-bit color ramp targets dark terminals; light backgrounds may reduce text contrast. The numerical percentage also identifies usage without color. When Ponytail is active, its local flag supplies a badge without loading a plugin script. The renderer uses Claude Code's current `effort.level` and `session_name` fields rather than scanning transcripts; see the [status line contract](https://code.claude.com/docs/en/statusline).

Remaining tokens use `context_window.remaining_percentage` when supplied, otherwise the complement of `used_percentage`, multiplied by the window capacity. The `~` label identifies an estimate from the last API response, not an instantaneous token count. Running duration comes from `cost.total_duration_ms`; it accumulates across resumes and excludes time when the session is closed. Quota windows are optional across providers. Reset countdowns use the supplied Unix timestamp and the local clock. Without `refreshInterval`, time indicators update only on Claude events; offer a periodic refresh separately when the user wants idle countdown updates. The two rows group identity and resources; a resource row may wrap on narrow terminals.

Claude Code sets `current_usage` to `null` before its first API response and after `/compact` until another API response. During that interval, the renderer retains the last measured Context segment and marks it `(last)`; this includes the old capacity and token estimate, which do not describe the compacted context. A missing percentage receives the same treatment. It accepts valid zero values and decreases immediately, and shows `<1%` for nonzero context usage below 1%. A valid percentage without capacity is displayed without a token estimate and preserves the last complete snapshot for later fallback; it neither combines new ratios with old capacity nor extends that snapshot's lifetime. A model or capacity change discards retained context; a model change also discards retained quotas. Live directory, model, effort and session name are never restored from old input.

A missing running duration can retain its last measurement too. Context and duration snapshots expire after 24 hours without a valid update. Each missing quota window can retain a snapshot for at most 30 seconds, only with a known reset time still in the future; expiry removes it immediately. Every retained field carries `(last)`, and quota countdowns continue from the saved reset timestamp. Numeric resource snapshots live under `<config-dir>/statusline-demon/cache/`, isolated by a hash of `session_id`; no identifier means no persistence. Old cache files are removed after a day of inactivity. Corrupt or unwritable caches fall back to current data. The cache contains neither transcripts nor identity labels and is separate from installation restoration state.

Ask whether to configure it. If declined, continue repository setup. Approval applies to the status line configuration; installation of the skill pack remains the user's separate choice.

## Inspect before proposing a write

1. Resolve the installed skill directory and Claude's config directory: `CLAUDE_CONFIG_DIR` when set, otherwise `~/.claude`. Read its `settings.json` and existing `statusLine`, plus any project/local override of `statusLine` in the current workspace. If an override would mask the user setting, show it and resolve that conflict explicitly before writing; this installer only manages the selected config directory's `settings.json`.
2. Verify Python 3 is available. Resolve the shell Claude uses for status-line commands: Windows uses Git Bash when configured/available, otherwise PowerShell; POSIX uses its active shell. For composition, select that executable explicitly rather than Python's platform-default `shell=True`.
3. If an existing status line is present, inspect its renderer, show its command, and ask the user to keep it, compose with it, or replace it. Keep means no writes. Recommend replacement when the existing renderer already supplies the same fields, including the older transcript-scanning version; the new renderer also supplies its Ponytail badge. Composition keeps the previous output on separate rows and gives both renderers the same JSON input. It may repeat fields the existing renderer already shows; present that trade-off when choosing. Padding and refresh behavior are preserved, including event-only refresh when `refreshInterval` is absent. A new status line defaults to a three-second refresh. Composition retains the prior Vim-mode visibility setting; replacement restores Claude's native Vim indicator because this renderer does not draw it.
4. Present the exact command and destinations, then write after approval. The payload lands under `<config-dir>/statusline-demon/`; only the `statusLine` setting changes. These helpers do not edit permissions, install Python, or manage other status-line plugins.

## Configure

From this skill's directory, preview the chosen mode with `--dry-run`:

```bash
python scripts/install-statusline.py --mode replace --shell-kind posix --dry-run
python scripts/install-statusline.py --mode compose --shell-kind posix --shell-path <actual-shell> --dry-run
python scripts/install-statusline.py --mode replace --shell-kind powershell --dry-run
```

Use the matching shell kind for Claude's outer command. In composition mode, `--shell-path` is the executable that runs the previous command. Pass `--config-dir <directory>` only for an explicitly selected alternate config directory. Remove `--dry-run` after the preview is approved. The installer backs up existing settings, copies the renderer, preserves unrelated settings, and records the original status-line object. Repeated installs use the original command rather than wrapping the wrapper. Before writing settings, the installer records a pending operation with its previous and intended status-line objects and prior restoration state. A retry resolves an interrupted install or restore only when the current `statusLine` matches one of those objects; any other value stops for review. Successful writes clear the pending record, and `--dry-run` leaves it unchanged. Ordinary settings-write errors roll back the restoration state. Without a pending record, a mismatch with the owned installation still blocks install and restore.

Each previous command gets at most two seconds to produce output; an invalid command configuration, failure or timeout leaves the Demon row visible. This is the wrapper's limit, not a Claude runtime timeout. Composition preserves the previous command text and intentional ANSI output, adding a reset after each row to prevent style bleed; it does not resolve that tool's dependencies or combine duplicate fields. A Ponytail badge already in the previous output is not added again.

Restore the captured original configuration after the user asks to undo this setup:

```bash
python scripts/install-statusline.py --action restore --dry-run
```

Remove `--dry-run` after confirming the restoration. Renderer and state files remain available, while the settings return to the original command or omit `statusLine` if there was none. An external edit blocks restoration too.

## Verify and finish

Run the isolated acceptance checks when changing these helpers:

```bash
python -I scripts/test-statusline.py
```

They cover current payload fields without transcript access, absent/zero fields, safe label output, consecutive renders with missing measurements, session isolation, valid decreases and resets, quota expiry, cache failures, replay of stdin to an existing renderer, preserved settings, repeated installation, restoration, interrupted-write recovery, malformed composition configuration, and refusal after an external status-line edit. They use temporary config directories.

For an approved real setup, pipe a representative Claude payload into the installed command and inspect its output. Keep the check local and avoid printing credentials or full transcripts. Confirm both rows in composition mode and that no personal path from the source repository is embedded. Claude reloads settings automatically; script edits take effect on the next event or refresh. Tell the user how to inspect or edit `statusLine` and name any rendering or runtime check that was not performed.
