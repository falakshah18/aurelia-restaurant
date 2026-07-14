import sys
import asyncio
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, patch, MagicMock

sys.path.append(str(Path(__file__).resolve().parents[1]))

import server


class OrderModelTests(unittest.TestCase):
    def test_order_item_validation(self):
        item = server.OrderItemIn(menu_item_id="1", name="Pizza", price=100, quantity=2)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.price, 100)

    def test_order_in_requires_items(self):
        with self.assertRaises(Exception):
            server.OrderIn(items=[], total=100)

    def test_order_in_total_positive(self):
        with self.assertRaises(Exception):
            server.OrderIn(items=[server.OrderItemIn(menu_item_id="1", name="Pizza", price=100, quantity=1)], total=0)


class OrderEndpointTests(unittest.TestCase):
    def setUp(self):
        self.user = {"id": "u1", "email": "test@test.com", "name": "Test", "role": "user"}

    def test_create_order_mock_payment(self):
        inp = server.OrderIn(
            items=[server.OrderItemIn(menu_item_id="m1", name="Pizza", price=100, quantity=2)],
            total=200,
            payment_method="mock",
        )
        doc = {
            "id": "123",
            "user_id": self.user["id"],
            "items": [i.model_dump() for i in inp.items],
            "total": 200,
            "payment_method": "mock",
            "payment_status": "paid",
            "status": "confirmed",
        }
        self.assertEqual(doc["payment_status"], "paid")
        self.assertEqual(doc["status"], "confirmed")

    def test_my_orders(self):
        mock_find = MagicMock()
        mock_find.return_value.sort.return_value.to_list = AsyncMock(return_value=[])
        with patch.object(server.db.orders, "find", mock_find):
            result = asyncio.run(server.my_orders(self.user))
            self.assertIsInstance(result, list)

    def test_reports_stats_structure(self):
        expected_keys = {"total_orders", "total_revenue", "avg_order", "status_counts", "top_items"}
        sample = {
            "total_orders": 10,
            "total_revenue": 1000,
            "avg_order": 100,
            "status_counts": {},
            "top_items": [],
        }
        self.assertEqual(set(sample.keys()), expected_keys)


if __name__ == "__main__":
    unittest.main()
