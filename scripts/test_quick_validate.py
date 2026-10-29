#!/usr/bin/env python3

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


VALIDATOR = Path(__file__).with_name("quick_validate.py")


class QuickValidateTests(unittest.TestCase):
    def run_skill(self, frontmatter):
        with tempfile.TemporaryDirectory() as directory:
            skill = Path(directory)
            (skill / "SKILL.md").write_text(
                f"---\n{frontmatter}\n---\n\n# Test skill\n",
                encoding="utf-8",
                newline="\n",
            )
            return subprocess.run(
                [sys.executable, str(VALIDATOR), str(skill)],
                capture_output=True,
                text=True,
                encoding="utf-8",
                check=False,
            )

    def assert_rejected(self, frontmatter, message):
        result = self.run_skill(frontmatter)
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
        )
        for frontmatter, message in cases:
            with self.subTest(message=message):
                self.assert_rejected(frontmatter, message)


if __name__ == "__main__":
    unittest.main()
