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
- Add or update an [Agent Note](.agents/notes/README.md) for every non-trivial change.

## License

By contributing, you agree that your contributions are licensed under the repository's MIT license.
