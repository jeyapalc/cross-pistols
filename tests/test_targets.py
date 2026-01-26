import unittest
from playwright.sync_api import sync_playwright

class TestTargets(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.page = self.browser.new_page()
        self.page.goto("http://localhost:8000")

    def tearDown(self):
        self.page.close()

    def test_instructor_course_targets(self):
        """Verify targets for Instructor Course"""
        self.page.click("#instructorBtn")

        expected_targets = [
            "images/1-01-01 (1).svg",
            "images/2-01 (2).svg",
            "images/1-01-01 (1).svg",
            "images/2-01 (2).svg"
        ]

        for i, expected_src in enumerate(expected_targets):
            print(f"Testing Instructor Stage {i+1}...")
            self.verify_stage(i, expected_src)

    def test_regular_member_course_targets(self):
        """Verify targets for Regular Member Course"""
        self.page.click("#memberBtn")

        expected_targets = [
            "images/1-01-01 (1).svg", # Stage 1
            "images/2-01 (2).svg",    # Stage 2
            "images/1-01-01 (1).svg", # Stage 3 (Block 1)
            "images/2-01 (2).svg"     # Stage 4
        ]

        for i, expected_src in enumerate(expected_targets):
            print(f"Testing Member Stage {i+1}...")
            self.verify_stage(i, expected_src)

    def verify_stage(self, stage_index, expected_src):
        # Open dropdown
        self.page.click("#stage-select-btn")
        # Click stage link
        self.page.click(f"#stage-select-dropdown a[data-stage-index='{stage_index}']")

        # Click Start
        self.page.click("#start")

        # Wait for the target to be presented.
        try:
            # Wait for #turner to have class 'facing' which means target is shown
            # Max delay is around 12s, so 15s timeout is safe.
            self.page.wait_for_selector("#turner.facing", state="attached", timeout=15000)

            # Check the image source
            target_img = self.page.locator("#targetImg")
            src = target_img.get_attribute("src")

            self.assertEqual(src, expected_src, f"Stage {stage_index+1} expected {expected_src} but got {src}")

        except Exception as e:
            self.page.screenshot(path=f"tests/failure_stage_{stage_index}.png")
            raise e
        finally:
            # Reset for next test
            self.page.keyboard.press("Escape")
            self.page.wait_for_timeout(1000) # Give it time to reset state

if __name__ == "__main__":
    unittest.main()
