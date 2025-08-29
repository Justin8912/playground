from util.browser_config import setup_driver
from navigation.to_moderate_tab import navigate_to_moderate_tab
from logic.logic import get_student_compliance_data
from util.create_results_file import create_results_file
import os

def main():
    driver = setup_driver()
    result = {}
    try:
#         url = input("Please enter the Canvas URL: ").strip()
        url = "https://utexas.instructure.com/courses/1406675/assignments/7128533"
        print(f"Navigating to: {url}")
        driver.get(url)
        print("Please complete authentication in the browser.")
        input("Press Enter after you have successfully logged in...")

        navigate_to_moderate_tab(driver)

        print("Starting student compliance data collection...")
        student_compliance = get_student_compliance_data(result, driver)
        create_results_file(student_compliance)
        print("Results have been saved to ./results.txt")
        # TODO: Remove - this is for testing.
        input("Press Enter to close the browser...")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
#         driver.quit()
        print("Wouldve quit")


if __name__ == "__main__":
    main()
