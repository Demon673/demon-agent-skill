#!/usr/bin/env python3

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


VALIDATOR = Path(__file__).with_name("quick_validate.py")


class QuickValidateTests(unittest.TestCase):
    def run_skill(self, frontmatter, codex_metadata=None):
        with tempfile.TemporaryDirectory() as directory:
            skill = Path(directory)
            (skill / "SKILL.md").write_text(
                f"---\n{frontmatter}\n---\n\n# Test skill\n\n中文\n",
                encoding="utf-8",
                newline="\n",
            )
            if codex_metadata is not None:
                metadata = skill / "agents" / "openai.yaml"
                metadata.parent.mkdir()
                metadata.write_text(codex_metadata, encoding="utf-8", newline="\n")
            return subprocess.run(
                [sys.executable, str(VALIDATOR), str(skill)],
                capture_output=True,
                text=True,
                encoding="utf-8",
                check=False,
            )

    def assert_rejected(self, frontmatter, message, codex_metadata=None):
        result = self.run_skill(frontmatter, codex_metadata)
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertIn(message, result.stdout)

    def test_required_fields_cannot_be_whitespace_only(self):
        cases = (
            (
                'name: "   "\ndescription: "Useful description"',
                "Name must not be empty",
            ),
            (
                'name: "valid-name"\ndescription: "   "',
                "Description must not be empty",
            ),
        )
        for frontmatter, message in cases:
            with self.subTest(message=message):
                self.assert_rejected(frontmatter, message)

    def test_existing_type_and_format_checks_remain(self):
        cases = (
            ("name: 123\ndescription: Useful description", "Name must be a string"),
            ("name: Bad_Name\ndescription: Useful description", "should be hyphen-case"),
            ("name: valid-name\ndescription: [not, a, string]", "Description must be a string"),
            ("name: valid-name\ndescription: 'Use <tags>'", "Description cannot contain angle brackets"),
            (
                "name: valid-name\ndescription: Useful description\ndisable-model-invocation: 'true'",
                "'disable-model-invocation' must be a boolean",
            ),
        )
        for frontmatter, message in cases:
            with self.subTest(message=message):
                self.assert_rejected(frontmatter, message)

    def test_manual_skill_requires_matching_codex_policy(self):
        frontmatter = (
            "name: valid-name\ndescription: Useful description\n"
            "disable-model-invocation: true"
        )
        result = self.run_skill(
            frontmatter,
            "policy:\n  allow_implicit_invocation: false\n",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

        self.assert_rejected(frontmatter, "Codex metadata not found")
        for metadata in (
            "interface: {}\n",
            "policy:\n  allow_implicit_invocation: true\n",
        ):
            with self.subTest(metadata=metadata):
                self.assert_rejected(
                    frontmatter,
                    "must set policy.allow_implicit_invocation: false",
                    metadata,
                )

    def test_malformed_codex_metadata_is_rejected_for_manual_skill(self):
        self.assert_rejected(
            "name: valid-name\ndescription: Useful description\ndisable-model-invocation: true",
            "Invalid YAML in agents/openai.yaml",
            "policy: [\n",
        )

    def test_codex_metadata_is_optional_for_automatic_skills(self):
        result = self.run_skill(
            "name: valid-name\ndescription: Useful description",
            "policy: [\n",
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
