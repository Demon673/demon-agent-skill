"""Exercise the DOTA2 API search CLI against isolated snapshot fixtures."""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "skills/dota2/dota2-custom-game-dev/scripts/search_dota2_api.py"


class DotaApiSearchTest(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="dota-api-search-test-")
        self.addCleanup(self.temporary.cleanup)
        self.skill = Path(self.temporary.name) / "skill"
        resource = self.skill / "references/vendor/vscode-dota2-tools/resource"
        resource.mkdir(parents=True)
        (self.skill / "scripts").mkdir()
        self.script = self.skill / "scripts/search_dota2_api.py"
        shutil.copy2(SCRIPT, self.script)
        snapshot = {
            "class_list": {
                "ExampleClass": [
                    {
                        "function": "MixedParameters",
                        "params": {
                            "int_11": {"params_name": "eleven", "type": "int"},
                            "bool_2": {"params_name": "two", "type": "bool"},
                            "string_1": {"params_name": "one", "type": "string"},
                            "handle_10": {"params_name": "ten", "type": "handle"},
                            "<unknown>_9": {"params_name": "nine", "type": "unknown"},
                        },
                    }
                ]
            },
            "enum_list": {
                "TestEnum": [
                    {"name": "FIRST", "description": "ordinary member"},
                    {"name": "TARGET", "description": "unique-token-更新"},
                    {"name": "THIRD", "description": "another member"},
                ]
            },
        }
        (resource / "dota_script_help2.json").write_text(json.dumps(snapshot), encoding="utf-8")

    def run_cli(self, *arguments):
        environment = os.environ.copy()
        environment["PYTHONIOENCODING"] = "gbk:strict"
        environment["PYTHONUTF8"] = "0"
        result = subprocess.run(
            [sys.executable, str(self.script), "--kind", "lua", *arguments],
            capture_output=True,
            env=environment,
            timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stderr.decode("utf-8", errors="replace"))
        return [json.loads(line) for line in result.stdout.decode("utf-8").splitlines()]

    def test_lua_parameter_order_uses_numeric_suffix(self):
        result = self.run_cli("--query", "MixedParameters")[0]
        self.assertEqual(
            [parameter["name"] for parameter in result["params"]],
            ["one", "two", "nine", "ten", "eleven"],
        )

    def test_enum_name_returns_full_enum(self):
        result = self.run_cli("--query", "TestEnum")[0]
        self.assertEqual([member["name"] for member in result["values"]], ["FIRST", "TARGET", "THIRD"])

    def test_enum_value_returns_only_matching_members_with_utf8_on_legacy_stdout(self):
        result = self.run_cli("--query", "unique-token")[0]
        self.assertEqual([member["name"] for member in result["values"]], ["TARGET"])
        self.assertEqual(result["values"][0]["description"], "unique-token-更新")


if __name__ == "__main__":
    unittest.main()
