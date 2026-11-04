---
name: record-browser-gif
description: Record browser or Web UI interaction demos as optimized GIFs and publish authorized PR media through the repository host's native attachments. Use for requested browser demos and pull requests with user-visible GUI changes.
---

# Record Browser GIF

Produce a short, truthful UI demonstration as a local GIF, and — only when the task includes attaching it to a pull request — publish it through the attach workflow at the end of this skill. Use the available browser-control workflow. When it exposes video capture, record the same controlled context through video; otherwise capture verified states as screenshots. Use the bundled encoder for trimming, playback speed, final hold, dimensions, and size.

## Every GUI pull request includes a GIF

A pull request that changes product-user-visible GUI behavior MUST include a demonstration GIF recorded with this skill and embedded in the pull request body via [the attach workflow](#publish-the-gif).

The recording itself is part of the evidence: use a real server booted from that pull request's branch tree, real credentials, and real data flow (including model rounds where the application is model-backed). Never substitute fixture queries, mock transports, synthetic event injection, or test-only hooks unless the user explicitly asked for a fixture recording. Next to the embed, state the exact demonstrated commit SHA, the tree and origin that served it, any mode flags or browser-state exceptions, and whether a real model round ran, so reviewers know exactly what the recording proves.

## Keep recording separate from publication

- Recording produces local video or screenshots and one `.gif` artifact only; it never mutates remote state.
- Publication uploads the GIF to the repository host's native attachment storage and embeds its returned URL in the pull request body. Perform it only when the task includes attaching the GIF to a pull request.
- Preserve the requested recording conditions. A real-server or real-API demo must not use fixture queries, mock transports, synthetic event injection, or test-only hooks. If credentials or the server are unavailable, report that limitation instead of substituting a fixture.
- Never read or expose credential values. Use the application's normal configuration path and a benign demonstration prompt.

## Stage the application

A GIF for a specific pull request demonstrates that pull request's tree, so stage per pull request:

1. Require a clean worktree, record its exact commit with `git rev-parse HEAD`, then build that recorded tree with the repository's build commands. A GIF recorded against another commit's build misattributes the evidence.
2. Boot one server per port from that tree with the application's fresh state roots, workspace, and session state. Give the browser a fresh isolated context or profile as well; if the browser workflow cannot create one, clear that origin's cookies and site storage before navigation so persisted client state cannot affect the evidence.
3. Treat one storyboard as one evidence run: every published frame comes from that server and those state roots, workspace, session, and data-flow scenario run. If capture automation fails, discard its frames and rerun from fresh roots; never splice frames from separate runs.
4. When switching between pull requests, stop the old server by PID or an exact match on its command line. A broad `pkill -f` pattern can match and kill the shell that launched it — including your own.

## Record the flow

Follow the available browser-control workflow's setup, interaction, and cleanup instructions. When it exposes `recordVideo`, enable video on the same controlled context to capture intermediate frames. Otherwise use [screenshot capture](#screenshot-capture) within that workflow; video availability does not determine which browser-control workflow to use. Existing user browser state remains an explicit isolation exception.

Only when browser control is unavailable, use the repository-declared Playwright dependency in an isolated headless browser and state that fallback in the capture notes. Do not install another driver or open the user's browser.

Before recording, identify the origin, built or development server, transport, and any mode overrides. When a production default opens a native surface that automation cannot drive, select an official browser-operable production backend through normal application configuration and disclose the override. Store the script, raw video, timing notes, QA frames, and GIF under the repository's gitignored browser-tool output directory, for example `.playwright-mcp/`. Create the run directory first.

### Capture video

Match `viewport` and `recordVideo.size` explicitly: Playwright otherwise scales the video down to fit 800×800, which can make UI text unreadable. Configure video through the chosen browser-control workflow. The standalone Playwright fallback can use this shape where `playwright` resolves from the repository's declared dependency:

```js
import { chromium } from 'playwright'
import { join } from 'node:path'

const browser = await chromium.launch()
const size = { width: 1440, height: 900 }
const context = await browser.newContext({
  viewport: size,
  recordVideo: { dir: join(runDir, 'videos'), size },
})
try {
  const page = await context.newPage()
  const video = page.video()
  // Navigate and exercise the real application here.
  await context.close()
  await video.saveAs(join(runDir, 'demo.webm'))
} finally {
  await context.close()
  await browser.close()
}
```

Set `runDir` to a fresh absolute path. Retain the page's video handle before closing it. Await `context.close()` before `video.saveAs()` or encoding; closing only the browser does not guarantee the video flushes. Each page has its own video: choose the demonstrated page explicitly and do not concatenate unrelated pages or runs. Failed runs are diagnostic only.

Choose a short story with three to six meaningful states. Wait for unique semantic locators before acting; use exact accessible-name matching and exact-text completion predicates that cannot match a prompt echo. Fixed waits may provide a reading hold after the state is verified, but never establish readiness. When capturing video, preserve animations and scrolling.

When demonstrating a tool call, rejection, or recovery, open its detail or trajectory so the video shows the tool identity, status or stable error code, and downstream result. If a transient running state matters, prompt for a slow foreground operation and observe its concrete DOM marker; continuous video captures its intermediate frames. Give the model a short final sentinel to anchor completion. Stop an unnecessarily long real-API run after the demonstrated state is visible.

Capture no secrets, personal data, unrelated tabs, or notifications. Browser video contains page content, not browser chrome; avoid rendering credential-bearing URLs in the application. Review the whole selected interval, including intermediate states. Keep one viewport throughout.

## Encode the GIF

Require `python3` (or `python` on Windows), `ffmpeg`, and `ffprobe`. If a media binary is missing, report the dependency instead of installing software without authorization. Set `GIF_SKILL_DIR` to this skill's absolute directory before using it in commands.

```sh
export GIF_SKILL_DIR=/absolute/path/to/this/skill
python3 "$GIF_SKILL_DIR/scripts/encode_gif.py" \
  /absolute/path/to/demo.webm \
  /absolute/path/to/demo.gif \
  --start 2 --end 32 --speed 2 --final-hold 3 \
  --fps 10 --max-width 1200 --colors 128
```

`--start` and `--end` select one continuous source interval in seconds. Defaults retain the full video at 1× speed and add a two-second final hold. `--speed` changes playback speed; disclose it and the selected interval beside the GIF so the demo cannot imply measured response latency. Use observed video times, not guessed wall-clock offsets, and preserve the complete cause and outcome of the demonstrated behavior. The final hold repeats the last selected frame. `--fps` sets the encoded GIF frame rate; increasing it cannot recover motion that the source recording did not capture. Keep the original video for QA; do not splice separate runs or synthesize missing states.

The encoder probes the video container duration, applies trim and speed before palette conversion, and checks encoded duration, animation, width, and byte size. It refuses an empty or out-of-range interval, a selection shorter than two output frames, mode-inappropriate flags, and accidental overwrite. Reduce `--max-width`, then `--colors` or `--fps`, for a large artifact; preserve readable text. Use `--force` only after resolving the exact output path.

Encoding writes a temporary file beside the target and validates it before publication. Failed encoding or verification removes that temporary file and preserves any existing target. `--force` uses atomic replacement; default publication requires filesystem hard-link support and fails safely when it is unavailable.

### Screenshot capture

When continuous video is unavailable or the user requests a storyboard, follow the available browser-control workflow. Capture three to six verified states from one isolated run with the browser's screenshot API. Save returned image bytes directly under one run directory as `00-initial.png`, `01-typed.png`, and so on; use identical dimensions and crop. For a transient state, poll its DOM marker and capture within the same browser-script call.

```sh
python3 "$GIF_SKILL_DIR/scripts/encode_gif.py" \
  /absolute/path/to/frames /absolute/path/to/demo.gif \
  --durations 1.5,1.5,1.5,3.5 --fps 10 --max-width 1200 --colors 128
```

One duration applies to every screenshot; otherwise supply one positive duration per frame and hold the settled state longest. Directory input rejects fewer than two frames and mismatched dimensions or duration counts. Video timing flags apply only to video files; `--durations` and `--pattern` apply only to screenshot directories.

## Verify the artifact

1. Read the encoder's JSON summary and confirm the output path, source interval and speed (or screenshot count), encoded frame count, dimensions, duration, and byte size.
2. Visually read the encoded GIF itself, not only the source frames. Confirm that the transition is legible, the last state is held long enough, and no sensitive content appears. If the viewer renders only the first frame, decode representative frames from the encoded GIF with `ffmpeg` and inspect those; the pre-encode frames do not prove the encoded order, palette, or final hold.
3. Run `git status --short` and confirm raw video, QA frames, and the artifact landed only under ignored paths.
4. Return the absolute GIF path, render it when the client supports local media, and state whether the recording used a real API, fixture, or another transport. When the task does not include attaching the GIF to a pull request, stop here.

Encoder maintenance: run `python3 -m unittest discover -s "$GIF_SKILL_DIR/scripts" -p 'test_*.py' -v` with the media prerequisites installed. Use `python` instead of `python3` on Windows.

The encoder and its regression tests retain their upstream MIT terms in [LICENSE.upstream](LICENSE.upstream).

## Publish the GIF

Perform this step only when the task includes attaching the GIF to a pull request.

Keep PR media in ignored local output and the repository host's native attachment storage. Creating or pushing a media-only Git branch requires an explicit user request.

1. Identify the actual repository host, existing authenticated client, native attachment API or upload UI, and file-size limits. A missing `gh --attach` capability is a client limitation; check the actual host's attachment workflow.
2. Immediately before uploading, compare the demonstrated pull request's live head (or its pushed branch tip before PR creation) with the commit recorded beside the artifact. Re-record when the demonstrated tree changed. A tooling PR may embed a clearly labeled example from another PR; identify that source PR and use its live head for these checks.
3. Upload through the host's native attachment workflow. Embed the returned media URL in the PR body using supported image or video syntax. Confirm a reused attachment belongs to the intended PR and matches the verified local artifact.
4. Re-read the live head and body after publication. Require the head to remain at the recorded commit, confirm that the body references the uploaded attachment, and inspect the rendered PR to verify inline display. Fetch the attachment through the intended authenticated reader path and check its response, media type, byte size, and checksum. A body containing Markdown or an anonymous `404` alone does not verify display.

When upload tooling, authentication, permissions, or host limits prevent publication, retain the verified local artifact and report attachment publication as pending with the concrete blocker. Continue independent authorized work and keep publication status separate from recording and code checks. Credentials stay in the host's normal authentication flow.

### Attach with gh

`gh --attach` requires `gh` v2.99.0 or later (`gh --version`), a repository on GitHub.com or GitHub Enterprise Cloud — GitHub Enterprise Server is not supported — write access to the repository, and a GIF at or below 10 MB. The [v2.99.0 release](https://github.com/cli/cli/releases/tag/v2.99.0) records the supported platforms. Confirm the verified artifact fits that limit; when it does not, shrink it with `--max-width`, then `--colors` or `--fps`, before attaching.

Write the GIF into the body file as an ordinary local-path reference, using the same path passed to `--attach`; `gh` rewrites the reference in place to the uploaded URL, keeping its position and alt text:

```markdown
![<alt text>](<path/to/demo.gif>)
```

After the live-head check, attach:

```sh
gh pr create --body-file <body.md> --attach <path/to/demo.gif>     # new pull request
gh pr edit <pr> --body-file <body.md> --attach <path/to/demo.gif>  # existing pull request
```

`--attach` is repeatable but refuses the same file twice. A GIF the body does not reference is appended at the end, where alt text set on the flag (`--attach '<path>#<alt text>'`) applies; a rewritten reference keeps the body's alt text. Complete the publication checks above.

### Attach on Gitea and other hosts

Use the current host's attachment client or documented API. Gitea provides [issue attachment uploads](https://docs.gitea.com/api/operations/issue-create-issue-attachment/) at `POST /api/v1/repos/{owner}/{repo}/issues/{index}/assets`; a PR uses its issue index. Send the verified file as the multipart `attachment` field and embed the returned `browser_download_url`. Confirm the endpoint and allowed media types against the target server's API documentation. A JSON-only CLI request is insufficient for multipart file upload; use an authenticated client that supports it or report publication pending.

Use the same native-attachment and rendered-display checks on other hosts. Keep existing published media references intact until replacements have been uploaded and verified; historical media cleanup is separate from recording a new demo.
