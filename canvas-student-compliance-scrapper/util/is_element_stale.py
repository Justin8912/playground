from selenium.common.exceptions import StaleElementReferenceException

def is_element_stale(element):
    try:
        # Attempt to check any property of the element
        _ = element.is_enabled()
        return False
    except StaleElementReferenceException:
        return True