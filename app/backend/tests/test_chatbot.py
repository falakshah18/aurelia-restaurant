import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

import server

MENU = [
    {"name": "Truffle Ravioli", "price": 895, "category": "Main", "description": "Handmade pasta with truffle cream", "badge": "Chef"},
    {"name": "Margherita Pizza", "price": 695, "category": "Main", "description": "Wood-fired pizza with basil", "badge": ""},
    {"name": "Chocolate Semifreddo", "price": 495, "category": "Dessert", "description": "Rich chocolate dessert", "badge": "Signature"},
]


class ChatbotReplyTests(unittest.TestCase):
    def test_pizza_question_gets_pizza_answer(self):
        reply = server._build_smart_reply("do you have pizza?", MENU)
        self.assertIn("Margherita Pizza", reply)
        self.assertNotIn("I am here to help!", reply)

    def test_hours_question_gets_hours_answer(self):
        reply = server._build_smart_reply("what are your opening hours?", MENU)
        self.assertIn("8:00 AM", reply)

    def test_different_questions_get_different_answers(self):
        pizza = server._build_smart_reply("show me pizza options", MENU)
        dessert = server._build_smart_reply("what desserts do you have?", MENU)
        location = server._build_smart_reply("where is the restaurant?", MENU)
        self.assertNotEqual(pizza, dessert)
        self.assertNotEqual(dessert, location)
        self.assertIn("Margherita", pizza)
        self.assertIn("Chocolate", dessert)
        self.assertIn("Ahmedabad", location)

    def test_follow_up_uses_history(self):
        history = [
            {"role": "user", "text": "tell me about truffle ravioli"},
            {"role": "bot", "text": "Our Truffle Ravioli is Rs.895. Handmade pasta with truffle cream."},
        ]
        reply = server._build_smart_reply("tell me more", MENU, history)
        self.assertIn("Truffle Ravioli", reply)

    def test_budget_recommendation_differs_from_signature(self):
        budget = server._build_smart_reply("something affordable please", MENU)
        signature = server._build_smart_reply("what is your signature dish?", MENU)
        self.assertNotEqual(budget, signature)


if __name__ == "__main__":
    unittest.main()
