from typing import Optional
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from services.dtype import PatentDocument


class SessionKeyError(Exception):
    pass


class DocProcessing:
    def __init__(self, session_key: str | None = None):
        self.document = PatentDocument()
        self.session_key = session_key

    def printTXT(self, name: str, content: str):
        with open(f"{name}.txt", "w", encoding="utf-8") as file:
            file.write(content)

    def retrieveHTML(self, filename: str) -> str:
        link = "https://ppubs.uspto.gov/pubwebapp/static/pages/ppubsbasic.html"
        selenium_grid_url = "http://selenium-firefox:4444/wd/hub"
        driver: WebDriver = None
        options = Options()
        options.add_argument('--headless')
        try:
            driver = webdriver.Remote(command_executor=selenium_grid_url, options=options)
            wait = WebDriverWait(driver, 20)

            if self.session_key:
                driver.get("https://ppubs.uspto.gov")
                driver.add_cookie({"name": "SESSION", "value": self.session_key})

            driver.get(link)

            quick_lookup_input = wait.until(EC.presence_of_element_located((By.ID, "quickLookupTextInput")))
            quick_lookup_input.send_keys(filename)
            search_button = driver.find_element(By.ID, "quickLookupSearchBtn")
            search_button.click()

            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "section.searchResultsArea:not(.d-none)")))

            text_api_link = wait.until(EC.element_to_be_clickable(
                (By.XPATH, "//a[contains(@href, '/api/patents/html/') and contains(text(), 'Text')]")
            ))

            driver.execute_script("arguments[0].setAttribute('target', '_self');", text_api_link)
            text_api_link.click()

            wait.until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            html_source = driver.page_source

            if "Sign In" in html_source or "sign in" in html_source.lower()[:2000]:
                raise SessionKeyError("USPTO session key missing or expired")

            return html_source

        except SessionKeyError:
            raise
        except Exception as e:
            print(f"An error occurred during Selenium operation: {e}")
            raise SessionKeyError(f"Failed to retrieve patent data: {e}")

        finally:
            if driver:
                driver.quit()

    def extract_section_text(self, soup: BeautifulSoup, section_title: str) -> Optional[str]:
        header = soup.find('h3', string=section_title)
        if not header:
            return None

        section = []
        current = header.find_next()
        while current and current.name != 'h3':
            if current.name == 'p':
                section.append(current.get_text(strip=True))
            current = current.find_next()

        return ' '.join(section) if section else None

    def process_document(self, filename: str) -> PatentDocument:
        html = self.retrieveHTML(filename)

        if not html:
            raise ValueError("Failed to retrieve HTML content.")

        soup = BeautifulSoup(html, 'html.parser')

        title_element = soup.find('h2', class_='bottom-border padding')
        if title_element:
            self.document.title = title_element.get_text(strip=True)

        inventor_label = soup.find('span', string="Inventor(s)")
        if inventor_label:
            self.document.inventor = inventor_label.find_next('span').get_text(strip=True)

        date_label = soup.find('span', string="Publication Date")
        if date_label:
            self.document.publication_date = date_label.find_next('span').get_text(strip=True)

        self.document.patentID = filename
        self.document.abstract = self.extract_section_text(soup, 'Abstract')
        self.document.background_summary = self.extract_section_text(soup, 'Background/Summary')
        self.document.description = self.extract_section_text(soup, 'Description')

        claims_header = soup.find('h3', string='Claims')
        if claims_header:
            claims_section = claims_header.find_parent('section')
            self.document.claims = claims_section.get_text(separator=' ', strip=True)
        return self.document
