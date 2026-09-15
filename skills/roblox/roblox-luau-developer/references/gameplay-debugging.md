# Roblox Gameplay Debugging

Diagnose runtime issues in Roblox experiences. Establish a reproducible path first, then localize the Server/Client boundary and data flow.

## Diagnostic order

1. Reproduce the issue: ask whether it happens in Play Solo, Start Server + Players, a live server, or on a specific device; collect Output errors, stack traces, trigger steps, player count, and network conditions.
2. Narrow the boundary: determine whether the issue lives in Server, Client, Replication, Physics, UI, DataStore, or an external service; find the relevant Script, LocalScript, ModuleScript, and Remote.
3. Trace the data flow: input source (player input, touch, ProximityPrompt, UI button, Remote); state storage (Attribute, ValueObject, CollectionService tag, module cache, DataStore); output (UI, character state, physics object, network replication, save data).
4. Add minimal instrumentation: print key Remote parameters, player UserId, Instance path, and state version; sample or gate high-frequency events so Output is not flooded; keep temporary logs easy to remove.
5. Regress after the fix: cover at least the relevant cases among solo, multi-player, respawn, leave-and-rejoin, server shutdown, low frame rate, and high latency.

## Common anchor points

- UI not updating: check the LocalScript runs, events are connected, and the Remote reaches the client.
- Server not responding: check Remote location, parameter types, permission checks, and which service the server script lives in.
- Players out of sync: check whether state is client-only, or an Instance sits outside a replicating container.
- Physics anomalies: check NetworkOwnership, Anchored, CollisionGroup, Massless, and constraints.
- Performance regressions: check `Heartbeat`/`RenderStepped` handlers, infinite loops, excessive Instance creation, and frequent pathfinding.
- Save data loss: check DataStore throttling, `pcall`, `BindToClose`, save-on-player-leave, and session locking.

## Respawn races

The player is durable; the character is replaceable. `CharacterAdded` can fire again while an earlier handler is still yielding, so an unguarded handler writes stale state onto a new character.

- Read the character from `player.Character` inside the handler instead of capturing it before a `task.wait` or a remote round trip.
- Keep a per-player generation counter: increment it on `CharacterAdded` and `CharacterRemoving`, capture it before every yield, and re-check it afterwards before applying anything.
- Disconnect the removed character's connections when it goes, so the current character only ever receives state from its own handler.

## Output

- Reproduce path: how to trigger the issue.
- Boundary: Server/Client/Replication/DataStore/UI/Physics.
- Root cause: expressed as a code path, not just a guess.
- Fix: minimal change and its risk.
- Verification: checks actually run; state static-analysis limits when Studio cannot run.
