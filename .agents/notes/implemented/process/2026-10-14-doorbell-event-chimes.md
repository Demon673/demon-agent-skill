# Agent Note: Adapt event chimes to the hook doorbell

Status: implemented

English | [中文](2026-10-14-doorbell-event-chimes.zh.md)

## Problem

The hook doorbell's Windows beep patterns and POSIX system bells do not carry the five event sounds used by the doorbell plugin. Approval and runtime failure share the needs-input and blocked cues, so listeners cannot distinguish those events. The Node helpers also fail when installed under an ES-module package, and the Windows background launch splits paths or summary arguments containing spaces.

## Decision

[agent-doorbell](../../../../skills/agent/agent-doorbell/SKILL.md) retains its standalone hook manager and bundles five short mono PCM WAVs rendered from the MIT-licensed [doorbell sound recipe](https://github.com/Demon673/demon-dsh-plugins/blob/ec8c53d/packages/doorbell/src/attention.ts). Native runners play the files through Windows SoundPlayer, macOS afplay, or Linux paplay/aplay, with platform sounds as fallback. Permission requests use the approval cue, runtime failures use failed, and explicit cancellation is silent. The generator owns the sound recipe; native playback requires neither Node nor the plugin host.

The Node helpers declare their CommonJS module scope locally. Both installers retain Claude executable-form hooks with a separate argument array and recognition of older hooks during replacement and uninstall.

Reminders belong to the main agent: child completion, teammate idle and intermediate task activity are silent. Installers exclude those events and replace old Doorbell registrations; runners also ignore stale child-event calls. Shared attention events require a parseable payload with no child identity; Claude exposes `agent_id`, and its notification matcher excludes background-agent notices. POSIX uses `jq` for this check and keeps shared events silent when the parser is unavailable. Other runtime adapters register completion only where shared events cannot identify the emitting agent.

Gemini reminders return neutral JSON instead of controlling notification delivery. [Runtime adapters](../../../../skills/agent/agent-doorbell/references/runtimes.md) record each runtime's event coverage and activation limits. The Windows runner uses an encoded command to preserve paths and summary arguments. Copilot CLI uses versioned flat hooks with direct executable arguments; Cursor uses an explicitly selected Node runner to distinguish completed, failed and aborted main turns from its status payload. Plugin-owned session state, client routing, and a warm player remain outside the skill because independent lifecycle hooks have no common service lifetime.

## Alternatives considered

- **Retire the skill in favor of the plugin.** The plugin's sound recipe and native playback work independently; CLI users still need hook installation and removal without a plugin host.
- **Copy the plugin's persistent player and session routing.** Independent hook processes cannot own the plugin's session stream or service lifecycle; a new daemon would add coordination beyond reminders.
- **Synthesize every chime at hook time.** Bundled WAVs keep the default runners native and reproduce the sound without synthesis startup or runtime dependencies.

## Consequences

- Event sounds are distinct across supported platforms when WAV playback is available; Linux requires paplay or aplay for that timbre, and quiet/normal use system volume.
- CLI events determine the default sound; response text does not establish a blocked goal in native runners. Completion and attention events can overlap; explicit event lists narrow noisy setups. Cross-client deduplication and plugin settings remain host capabilities.
- [Silent acceptance checks](../../../../skills/agent/agent-doorbell/references/verification.md) cover WAV loading, main-agent attention registration, silent child events, Cursor status selection, runtime command shapes, installer idempotency, uninstall scope, and preservation of unrelated settings. Hardware audibility and real CLI event delivery require platform acceptance beyond these checks.
