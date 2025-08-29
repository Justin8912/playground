from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException, TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from navigation.switch_to_iframe import switch_to_canvas_iframe
import time

def next_moderation_page(driver, page_number):
    try:
        time.sleep(0.5)
        next_button = driver.find_element(By.CSS_SELECTOR, "button[data-direction='next']")

        # Check if button is clickable (not disabled)
        if next_button.is_enabled():
            print(f"Found Next button, proceeding to page {page_number + 1}")
            next_button.click()

            # Wait for next page to load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )

            page_number += 1
            return page_number
        else:
            print("Next button is disabled, reached final page")
            return False

    except (NoSuchElementException, TimeoutException):
        print("No Next button found, reached final page")
        driver.save_screenshot("no_next_button.png")
        return False
