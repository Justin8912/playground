from navigation.switch_to_iframe import switch_to_canvas_iframe
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
import time


def navigate_to_moderate_tab(driver):
    try:
        print("Looking for the moderate tab")

        # Switch to the specific Canvas iframe
        if not switch_to_canvas_iframe(driver):
            raise TimeoutException("Could not access Canvas iframe")

        # Try multiple strategies to find the moderate tab
        selectors = [
            (By.ID, "nav-link-moderate"),
            (By.CSS_SELECTOR, "[data-automation*='moderate']"),
            (By.XPATH, "//a[contains(@id, 'moderate')]"),
            (By.XPATH, "//button[contains(@id, 'moderate')]"),
            (By.XPATH, "//*[contains(text(), 'Moderate')]"),
            (By.XPATH, "//a[contains(text(), 'Moderate')]"),
            (By.CSS_SELECTOR, "a[href*='moderate']"),
        ]

        moderate_tab = None
        for selector_type, selector_value in selectors:
            try:
                moderate_tab = WebDriverWait(driver, 5).until(
                    EC.element_to_be_clickable((selector_type, selector_value))
                )
                print(f"✓ Found moderate tab using: {selector_type}")
                break
            except TimeoutException:
                continue

        if not moderate_tab:
            driver.save_screenshot("debug_moderate_tab.png")
            raise TimeoutException("Could not find moderate tab in Canvas iframe")

        moderate_tab.click()
        print("✓ Clicked moderate tab")

        # Wait for moderate page to load (staying in iframe)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )
        print("✓ Moderate page loaded successfully")

    except TimeoutException as e:
        print(f"Could not find or click moderate tab: {e}")
        driver.save_screenshot("error_moderate_tab.png")
        raise


def back_to_moderate_tab(driver, student_name):
    # Navigate back to moderate tab using multiple strategies
    print(f"  Using browser back for {student_name}")
    driver.back()
    time.sleep(0.75)
#     if not switch_to_canvas_iframe(driver):
#         raise Exception("Could not switch back to Canvas iframe when attempting to navigate back to the moderate tab.")