"""Юнит-тесты ядра: модель сроков, dry-run Bitrix, парсер ГПР. `python3 -m unittest supply_core.test_supply -v`"""
import os
import unittest
from datetime import date

os.environ.setdefault("SUPPLY_TODAY", "2026-06-07")
from supply_core import model, gpr_plan          # noqa: E402
from supply_core.bitrix import Bitrix             # noqa: E402


class TestModel(unittest.TestCase):
    def _r(self, **kw):
        d = dict(mat="Бетон", qty="10 м3", work="Каркас", work_uid="W1", plot=3,
                 need="2026-06-20", lead=5, stage="req", stage_since="2026-06-01T00:00:00")
        d.update(kw)
        return model.Request(**d)

    def test_order_by_and_slack(self):
        r = self._r(need="2026-06-20", lead=5)
        self.assertEqual(model.order_by(r), date(2026, 6, 15))
        self.assertEqual(model.slack(r, date(2026, 6, 7)), 8)

    def test_on_time(self):
        self.assertTrue(model.on_time("2026-06-20", "2026-06-18"))
        self.assertFalse(model.on_time("2026-06-20", "2026-06-25"))
        self.assertFalse(model.on_time("2026-06-20", None))

    def test_risk_codes(self):
        self.assertEqual(model.risk(self._r(stage="arr"))[0], "done")
        self.assertEqual(model.risk(self._r(srv=True))[0], "srv")
        self.assertEqual(model.risk(self._r(hold="ПТО"))[0], "hold")


class TestBitrix(unittest.TestCase):
    def test_dry_run_no_network(self):
        b = Bitrix(webhook="", live=False)           # без вебхука — всегда dry
        self.assertTrue(b.dry_run)
        rid = b.create_sp178({"mat": "X", "qty": "1", "work": "W", "work_uid": "U",
                              "plot": 1, "need": "2026-06-10"})
        self.assertTrue(rid.startswith("DRY-"))

    def test_title_has_work_uid_last(self):
        t = Bitrix.request_title({"mat": "Кабель", "qty": "100 м", "work": "Электро",
                                  "work_uid": "AURA-P4-ELE", "plot": 4, "need": "2026-06-14"})
        self.assertIn("work_uid AURA-P4-ELE", t)
        self.assertTrue(t.rstrip().endswith("AURA-P4-ELE"))


class TestGpr(unittest.TestCase):
    def test_material_map(self):
        self.assertEqual(gpr_plan.material_for("Монтаж лифтов")[0], "Лифтовое оборудование")
        self.assertEqual(gpr_plan.material_for("Кладка стен")[0], "Газоблок, кладочный раствор")
        self.assertIsNone(gpr_plan.material_for("Земляные работы")[0])

    def test_every_material_has_keyword(self):
        # детектор «не подано» немой, если у материала нет ключа для поиска в заявках
        import re
        mats = {mat for _pat, mat, _lead in gpr_plan.WORK_MAT}
        missing = mats - set(gpr_plan.MAT_KW)
        self.assertFalse(missing, f"нет MAT_KW для: {missing}")
        for mat, kw in gpr_plan.MAT_KW.items():
            re.compile(kw)                           # все ключи — валидные регэкспы

    @unittest.skipUnless(os.path.exists(os.path.join(gpr_plan.GPR_DIR, "aura.pdf")), "нет ГПР PDF")
    def test_parse_aura_real_plots(self):
        w = gpr_plan.parse_object("aura")
        self.assertGreater(len(w), 100)
        self.assertTrue(all(x.get("start") for x in w))
        self.assertEqual(sorted(set(x["plot"] for x in w)), [3, 4, 5, 6, 7, 8])

    @unittest.skipUnless(os.path.exists(os.path.join(gpr_plan.GPR_DIR, "aura.pdf")), "нет ГПР PDF")
    def test_plan_only_not_started(self):
        for it in gpr_plan.plan("aura"):
            self.assertEqual(it["fact"], 0)          # в план берём только не начатые
            self.assertIn(it["status"], ("overdue", "now", "soon", "plan"))


if __name__ == "__main__":
    unittest.main()
