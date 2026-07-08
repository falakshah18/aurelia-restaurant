import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

import server


class OllamaPayloadTests(unittest.TestCase):
    def test_build_ollama_payload_includes_system_and_user_messages(self):
        payload = server.build_ollama_payload("Hello", "You are Aurelia")

        self.assertEqual(payload["model"], server.OLLAMA_MODEL)
        self.assertTrue(payload["stream"])
        self.assertEqual(payload["messages"][0]["role"], "system")
        self.assertEqual(payload["messages"][0]["content"], "You are Aurelia")
        self.assertEqual(payload["messages"][1]["role"], "user")
        self.assertEqual(payload["messages"][1]["content"], "Hello")


if __name__ == "__main__":
    unittest.main()
