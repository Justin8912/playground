from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from typing import Callable, Dict, Any


def create_chrome_options() -> webdriver.ChromeOptions:
    """Create optimized Chrome options."""
    options = webdriver.ChromeOptions()

    # Essential performance optimizations
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-images")

    return options

def create_firefox_options() -> webdriver.FirefoxOptions:
    """Create optimized Firefox options."""
    options = webdriver.FirefoxOptions()

    # Performance optimizations for Firefox
    options.set_preference("permissions.default.image", 2)  # Disable images
    options.set_preference("dom.ipc.plugins.enabled.libflashplayer.so", False)
    options.set_preference("media.volume_scale", "0.0")

    return options

def setup_chrome_driver() -> webdriver.Chrome:
    """Initialize Chrome WebDriver with optimal settings."""
    options = create_chrome_options()
    service = ChromeService(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=options)

def setup_firefox_driver() -> webdriver.Firefox:
    """Initialize Firefox WebDriver with optimal settings."""
    options = create_firefox_options()
    service = FirefoxService(GeckoDriverManager().install())
    return webdriver.Firefox(service=service, options=options)

# Browser setup factory
BROWSER_SETUPS: Dict[str, Callable[[], webdriver.Remote]] = {
    "chrome": setup_chrome_driver,
    "firefox": setup_firefox_driver,
}

def setup_driver(browser: str = "firefox") -> webdriver.Remote:
    """Initialize WebDriver for specified browser with optimal settings."""
    browser_lower = browser.lower()

    if browser_lower not in BROWSER_SETUPS:
        available = ", ".join(BROWSER_SETUPS.keys())
        raise ValueError(f"Unsupported browser: {browser}. Available: {available}")

    return BROWSER_SETUPS[browser_lower]()