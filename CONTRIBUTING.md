# Contributing

English | [中文](CONTRIBUTING.zh.md)

Thanks for your interest in contributing. This repository is a public source of reusable agent skills; contributions that add, improve, or fix a skill are welcome.

## Report issues

- Open an issue when a skill misfires, gives wrong guidance, or fails validation. Include a short reproduction and what you expected instead.
- Use the issue template that matches: bug for a defect, feature for a new skill or capability, task for maintenance work.

## Contribute a skill

- Keep each skill focused on one reusable capability and follow the [skill authoring rules](AGENTS.md).
- Write `SKILL.md` in English by default; the frontmatter `name` is hyphen-case and the `description` is behavior-based and trigger-focused.
- Run `.\scripts\validate-skills.ps1` for the changed skill and `npm run doc-gates` for any documentation or Agent Note change before opening a PR.
- Run `npm test` for maintenance-script or encoder changes. It includes the Doorbell and status line acceptance scripts and requires the [validation Python dependencies](requirements/skill-validation.txt), Bash, PowerShell (`powershell` on Windows or `pwsh` elsewhere), `ffmpeg`, and `ffprobe`; the Windows skill validator prepares the Python environment used by the test runner.
- CI runs tests and both gates on pushes to `main` and pull requests; the local git hooks cover the staged fast path, and `npm run install-lefthook` activates them once per clone.
- Edit skills in this source repository. The default Junction or symbolic-link installation reflects source edits immediately; `-Copy` / `--copy` and downloaded package installations need reinstalling to receive updates. Use the install scripts to create or replace installed entries.
- Add or update an [Agent Note](.agents/notes/README.md) for every non-trivial change.

## License

By contributing, you agree that your contributions are licensed under the repository's MIT license.
