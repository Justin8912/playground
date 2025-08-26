from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from navigation.switch_to_iframe import switch_to_canvas_iframe
import time


def next_moderation_page(driver):
    try:
        next_button = driver.find_element(By.CSS_SELECTOR, "button[data-direction='next']")

        # Check if button is clickable (not disabled)
        if next_button.is_enabled():
            print(f"Found Next button, proceeding to page {page_number + 1}")
            next_button.click()

            if not switch_to_canvas_iframe(driver):
                raise Exception("Could not switch back to Canvas iframe when attempting to navigating to the next moderate tab.")

            # Wait for next page to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )

            page_number += 1
        else:
            print("Next button is disabled, reached final page")
            return False

    except (NoSuchElementException, TimeoutException):
        print("No Next button found, reached final page")
        driver.save_screenshot("no_next_button.png")
        return False
