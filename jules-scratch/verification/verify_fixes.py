from playwright.sync_api import sync_playwright, expect
import os
import time

def run_verification(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    path = os.path.abspath('index.html')
    page.goto(f'file://{path}')

    # --- Verify Instructor Course ---
    # Stage 1: Check for no text
    page.get_by_role("button", name="Start Stage 1").click()
    expect(page.locator("#turner")).to_have_class("turner facing", timeout=15000)
    page.screenshot(path="jules-scratch/verification/instructor_stage_1_fixed.png")
    page.reload()

    # Stage 2: Check for no text
    page.get_by_role("button", name="▾").click()
    page.get_by_role("link", name="Stage 2").click()
    page.get_by_role("button", name="Start Stage 2").click()
    expect(page.locator("#turner")).to_have_class("turner facing", timeout=15000)
    page.screenshot(path="jules-scratch/verification/instructor_stage_2_fixed.png")
    page.reload()

    # Stage 3: Verify all 3 reps execute
    page.get_by_role("button", name="▾").click()
    page.get_by_role("link", name="Stage 3").click()
    page.get_by_role("button", name="Start Stage 3").click()

    # Rep 1
    expect(page.locator("#turner")).to_have_class("turner facing", timeout=15000)
    time.sleep(5) # Wait for par time

    # Rep 2
    expect(page.locator("#turner")).to_have_class("turner away", timeout=15000)
    expect(page.locator("#readyText")).to_have_text("Shooter be ready!")
    expect(page.locator("#turner")).to_have_class("turner facing", timeout=15000)
    page.screenshot(path="jules-scratch/verification/instructor_stage_3_rep2.png")
    time.sleep(5)

    # Rep 3
    expect(page.locator("#turner")).to_have_class("turner away", timeout=15000)
    expect(page.locator("#readyText")).to_have_text("Shooter be ready!")
    expect(page.locator("#turner")).to_have_class("turner facing", timeout=15000)
    page.screenshot(path="jules-scratch/verification/instructor_stage_3_rep3.png")

    browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)