from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support import expected_conditions as EC
import time
from numbers import Number

def switch_to_canvas_iframe(driver, sleepTime: Number = 0.5):
    """Switch to the Canvas iframe containing all quiz moderation elements."""
    time.sleep(sleepTime)
    try:
#         print("Switching to Canvas iframe...")
#
#         # Debug: List all iframes on the page
#         iframes = driver.find_elements(By.TAG_NAME, "iframe")
#         print(f"Found {len(iframes)} total iframes:")
#
#         for i, iframe in enumerate(iframes):
#             iframe_id = iframe.get_attribute('id') or 'no-id'
#             iframe_src = iframe.get_attribute('src') or 'no-src'
#             iframe_name = iframe.get_attribute('name') or 'no-name'
#             print(f"  {i+1}. ID: '{iframe_id}', Name: '{iframe_name}', Src: '{iframe_src[:100]}...'")

        # Use dynamic tool_content pattern for reliable iframe selection
        try:
            iframe = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//iframe[contains(@id, 'tool_content')]"))
            )
            driver.switch_to.frame(iframe)
            print(f"✓ Successfully switched to iframe using: xpath")
            return True
        except TimeoutException:
            print("✗ Could not find any iframe with 'tool_content' in ID")
            return False

    except Exception as e:
        print(f"✗ Error switching to Canvas iframe: {e}")
        return False