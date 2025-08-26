from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from navigation.to_moderate_tab import back_to_moderate_tab
from navigation.switch_to_iframe import switch_to_canvas_iframe
import time


def get_student_compliance_data(result, driver):
    """Collect compliance data from students across all pages in the Canvas iframe."""
    print("Beginning to retrieve student compliance data.")
    students_processed_per_page = {}
    student_compliance = {}
    page_number = 1
    students_processed_in_batch = 0

    while True:
        try:
            print(f"\n--- Processing Page {page_number} ---")
            main_table = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )

            # Get student count for current page
            student_count = len(main_table.find_elements(By.TAG_NAME, "tr")) - 1  # Skip header
            print(f"Found {student_count} students on page {page_number}")

            # Process all students on current page
            students_processed_in_batch = process_students(driver, student_compliance, student_count, page_number)

            # Look for Next button to proceed to next page
            try:
                next_button = driver.find_element(By.CSS_SELECTOR, "button[data-direction='next']")

                if next_button.is_enabled():
                    print(f"Found Next button, proceeding to page {page_number + 1}")
                    next_button.click()
                    time.sleep(1)  # Wait for page to load
                    page_number += 1
                else:
                    print("Next button is disabled, reached final page")
                    break

            except (NoSuchElementException, TimeoutException):
                print("No Next button found, reached final page")
                driver.save_screenshot("no_next_button.png")
                break

        except TimeoutException:
            print(f"Could not find main student table on page {page_number}")
            driver.save_screenshot("error_logic.png")
            break
        finally:
            if (students_processed_in_batch):
                students_processed_per_page[page_number] = students_processed_in_batch
            else:
                students_processed_per_page[page_number] = 0

    total_students = len(student_compliance)
    print(f"\n--- Pagination Complete ---")
    print(f"Processed {page_number} pages with {total_students} total students")
    result["students_processed_per_page"] = students_processed_per_page
    result["student_compliance"] = student_compliance
    return result

def count_quiz_violations(driver):
    """Count quiz violations in the log table (within iframe)."""
    violation_count = 0

    try:
        log_table = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "table"))
        )

        log_entries = log_table.find_elements(By.CLASS_NAME, "css-xp3jre-text")

        for entry in log_entries:
            entry_text = entry.get_attribute("innerHTML").strip()
            if "Stopped viewing the quiz-taking page" in entry_text:
                violation_count += 1

    except (NoSuchElementException, TimeoutException):
        print("Could not find log table or entries")

    return violation_count

def get_compliance_data(driver, student_compliance, student_name):
    time.sleep(0.5)
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "table"))
    )

    # Count violations
    violation_count = count_quiz_violations(driver)
    student_compliance[student_name] = violation_count
    print(f"  Found {violation_count} violations for {student_name}")

    back_to_moderate_tab(driver, student_name)

def process_students(driver, student_compliance, student_count, page_number):
    students_processed = 0
    for i in range(student_count):
        try:
            main_table = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )

            student_rows = main_table.find_elements(By.TAG_NAME, "tr")[1:]  # Skip header

            if i >= len(student_rows):
                print(f"Student index {i} out of range on page {page_number}, skipping")
                break

            row = student_rows[i]

            name_element = row.find_element(By.CSS_SELECTOR, "th button[data-automation='sdk-moderate-accommodations-edit']")
            student_name = name_element.text.strip()
            print(f"Processing student {i+1}/{student_count} on page {page_number}: {student_name}")

            # Find the log button
            td_elements = row.find_elements(By.TAG_NAME, "td")
            if len(td_elements) >= 4:
                session_log_button = td_elements[3].find_element(By.TAG_NAME, "button")
            else:
                raise NoSuchElementException(f"Row doesn't have enough columns for student {student_name}")

            if (session_log_button):
                session_log_button.click()
                get_compliance_data(driver, student_compliance, student_name)
                students_processed += 1
            else:
                print(f"  No session log button found for {student_name}, skipping")
            # Ensure page has reloaded
        except (NoSuchElementException, TimeoutException) as e:
            print(f"Error processing student {i+1} on page {page_number}: {e}")
            continue
    return students_processed