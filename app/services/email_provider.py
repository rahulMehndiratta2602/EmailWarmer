from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from app.models.email_account import EmailProvider
from playwright.async_api import Page, Locator
import random
import time
import logging

logger = logging.getLogger(__name__)

class EmailProviderBase(ABC):
    def __init__(self, page: Page):
        self.page = page
        self.logged_in = False

    async def _random_delay(self, min_ms: int = 1000, max_ms: int = 3000):
        """Add random delay to simulate human behavior"""
        await self.page.wait_for_timeout(random.randint(min_ms, max_ms))

    async def _random_mouse_movement(self):
        """Simulate random mouse movement"""
        await self.page.mouse.move(
            random.randint(0, 800),
            random.randint(0, 600)
        )

    async def _random_scroll(self):
        """Simulate random scrolling"""
        await self.page.mouse.wheel(
            delta_x=random.randint(-100, 100),
            delta_y=random.randint(-100, 100)
        )

    async def _simulate_human_behavior(self):
        """Simulate various human-like behaviors"""
        await self._random_mouse_movement()
        await self._random_scroll()
        await self._random_delay()

    async def _wait_for_element(self, selector: str, timeout: int = 10000) -> Optional[Locator]:
        """Wait for an element to be visible and return it"""
        try:
            element = self.page.locator(selector)
            await element.wait_for(state="visible", timeout=timeout)
            return element
        except Exception as e:
            logger.error(f"Error waiting for element {selector}: {str(e)}")
            return None

    @abstractmethod
    async def login(self, email: str, password: str) -> bool:
        """Login to the email provider"""
        pass

    @abstractmethod
    async def move_from_spam(self, email_id: str) -> bool:
        """Move email from spam to inbox"""
        pass

    @abstractmethod
    async def mark_important(self, email_id: str) -> bool:
        """Mark email as important"""
        pass

    @abstractmethod
    async def star_email(self, email_id: str) -> bool:
        """Star email"""
        pass

    @abstractmethod
    async def click_link(self, email_id: str, link_index: int) -> bool:
        """Click link in email"""
        pass

    @abstractmethod
    async def reply_email(self, email_id: str, message: str) -> bool:
        """Reply to email"""
        pass

class GmailProvider(EmailProviderBase):
    async def login(self, email: str, password: str) -> bool:
        try:
            await self.page.goto("https://mail.google.com")
            await self._random_delay()

            # Enter email
            email_input = await self._wait_for_element('input[type="email"]')
            if not email_input:
                return False
            await email_input.fill(email)
            await self._random_delay()
            await self.page.keyboard.press("Enter")

            # Enter password
            password_input = await self._wait_for_element('input[type="password"]')
            if not password_input:
                return False
            await password_input.fill(password)
            await self._random_delay()
            await self.page.keyboard.press("Enter")

            # Wait for inbox to load
            inbox = await self._wait_for_element('div[role="main"]')
            if not inbox:
                return False

            self.logged_in = True
            return True
        except Exception as e:
            logger.error(f"Gmail login failed: {str(e)}")
            return False

    async def move_from_spam(self, email_id: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Navigate to spam folder
            await self.page.goto("https://mail.google.com/mail/u/0/#spam")
            await self._random_delay()

            # Find and select the email
            email = await self._wait_for_element(f'div[data-message-id="{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Click "Not spam" button
            not_spam = await self._wait_for_element('div[role="button"][aria-label="Not spam"]')
            if not not_spam:
                return False

            await not_spam.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to move email from spam: {str(e)}")
            return False

    async def mark_important(self, email_id: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-message-id="{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Click "Mark as important" button
            important = await self._wait_for_element('div[role="button"][aria-label="Mark as important"]')
            if not important:
                return False

            await important.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to mark email as important: {str(e)}")
            return False

    async def star_email(self, email_id: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-message-id="{email_id}"]')
            if not email:
                return False

            # Click star button
            star = await self._wait_for_element('div[role="button"][aria-label="Star"]')
            if not star:
                return False

            await star.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to star email: {str(e)}")
            return False

    async def click_link(self, email_id: str, link_index: int) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-message-id="{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Find all links in the email
            links = await self.page.locator('a').all()
            if not links or link_index >= len(links):
                return False

            # Click the specified link
            await links[link_index].click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to click link: {str(e)}")
            return False

    async def reply_email(self, email_id: str, message: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-message-id="{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Click reply button
            reply = await self._wait_for_element('div[role="button"][aria-label="Reply"]')
            if not reply:
                return False

            await reply.click()
            await self._random_delay()

            # Type reply message
            await self.page.keyboard.type(message)
            await self._random_delay()

            # Send the reply
            send = await self._wait_for_element('div[role="button"][aria-label="Send"]')
            if not send:
                return False

            await send.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to reply to email: {str(e)}")
            return False

class OutlookProvider(EmailProviderBase):
    async def login(self, email: str, password: str) -> bool:
        try:
            await self.page.goto("https://outlook.live.com/owa/")
            await self._random_delay()

            # Enter email
            email_input = await self._wait_for_element('input[type="email"]')
            if not email_input:
                return False
            await email_input.fill(email)
            await self._random_delay()
            await self.page.keyboard.press("Enter")

            # Enter password
            password_input = await self._wait_for_element('input[type="password"]')
            if not password_input:
                return False
            await password_input.fill(password)
            await self._random_delay()
            await self.page.keyboard.press("Enter")

            # Wait for inbox to load
            inbox = await self._wait_for_element('div[role="main"]')
            if not inbox:
                return False

            self.logged_in = True
            return True
        except Exception as e:
            logger.error(f"Outlook login failed: {str(e)}")
            return False

    async def move_from_spam(self, email_id: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Navigate to spam folder
            await self.page.goto("https://outlook.live.com/mail/junkemail/")
            await self._random_delay()

            # Find and select the email
            email = await self._wait_for_element(f'div[data-convid="{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Click "Not junk" button
            not_junk = await self._wait_for_element('button[name="Not junk"]')
            if not not_junk:
                return False

            await not_junk.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to move email from spam: {str(e)}")
            return False

    async def mark_important(self, email_id: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-convid="{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Click "Mark as important" button
            important = await self._wait_for_element('button[name="Mark as important"]')
            if not important:
                return False

            await important.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to mark email as important: {str(e)}")
            return False

    async def star_email(self, email_id: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-convid="{email_id}"]')
            if not email:
                return False

            # Click star button
            star = await self._wait_for_element('button[name="Flag"]')
            if not star:
                return False

            await star.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to star email: {str(e)}")
            return False

    async def click_link(self, email_id: str, link_index: int) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-convid="{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Find all links in the email
            links = await self.page.locator('a').all()
            if not links or link_index >= len(links):
                return False

            # Click the specified link
            await links[link_index].click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to click link: {str(e)}")
            return False

    async def reply_email(self, email_id: str, message: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-convid="{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Click reply button
            reply = await self._wait_for_element('button[name="Reply"]')
            if not reply:
                return False

            await reply.click()
            await self._random_delay()

            # Type reply message
            await self.page.keyboard.type(message)
            await self._random_delay()

            # Send the reply
            send = await self._wait_for_element('button[name="Send"]')
            if not send:
                return False

            await send.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to reply to email: {str(e)}")
            return False

class YahooProvider(EmailProviderBase):
    async def login(self, email: str, password: str) -> bool:
        try:
            await self.page.goto("https://mail.yahoo.com")
            await self._random_delay()

            # Enter email
            email_input = await self._wait_for_element('input[type="text"]')
            if not email_input:
                return False
            await email_input.fill(email)
            await self._random_delay()
            await self.page.keyboard.press("Enter")

            # Enter password
            password_input = await self._wait_for_element('input[type="password"]')
            if not password_input:
                return False
            await password_input.fill(password)
            await self._random_delay()
            await self.page.keyboard.press("Enter")

            # Wait for inbox to load
            inbox = await self._wait_for_element('div[role="main"]')
            if not inbox:
                return False

            self.logged_in = True
            return True
        except Exception as e:
            logger.error(f"Yahoo login failed: {str(e)}")
            return False

    async def move_from_spam(self, email_id: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Navigate to spam folder
            await self.page.goto("https://mail.yahoo.com/d/folders/6")
            await self._random_delay()

            # Find and select the email
            email = await self._wait_for_element(f'div[data-test-id="message-item-{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Click "Not spam" button
            not_spam = await self._wait_for_element('button[data-test-id="not-spam"]')
            if not not_spam:
                return False

            await not_spam.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to move email from spam: {str(e)}")
            return False

    async def mark_important(self, email_id: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-test-id="message-item-{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Click "Mark as important" button
            important = await self._wait_for_element('button[data-test-id="mark-important"]')
            if not important:
                return False

            await important.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to mark email as important: {str(e)}")
            return False

    async def star_email(self, email_id: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-test-id="message-item-{email_id}"]')
            if not email:
                return False

            # Click star button
            star = await self._wait_for_element('button[data-test-id="star"]')
            if not star:
                return False

            await star.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to star email: {str(e)}")
            return False

    async def click_link(self, email_id: str, link_index: int) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-test-id="message-item-{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Find all links in the email
            links = await self.page.locator('a').all()
            if not links or link_index >= len(links):
                return False

            # Click the specified link
            await links[link_index].click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to click link: {str(e)}")
            return False

    async def reply_email(self, email_id: str, message: str) -> bool:
        try:
            if not self.logged_in:
                return False

            # Find and select the email
            email = await self._wait_for_element(f'div[data-test-id="message-item-{email_id}"]')
            if not email:
                return False

            await email.click()
            await self._random_delay()

            # Click reply button
            reply = await self._wait_for_element('button[data-test-id="reply"]')
            if not reply:
                return False

            await reply.click()
            await self._random_delay()

            # Type reply message
            await self.page.keyboard.type(message)
            await self._random_delay()

            # Send the reply
            send = await self._wait_for_element('button[data-test-id="send"]')
            if not send:
                return False

            await send.click()
            await self._random_delay()
            return True
        except Exception as e:
            logger.error(f"Failed to reply to email: {str(e)}")
            return False

class EmailProviderFactory:
    @staticmethod
    def create_provider(provider: EmailProvider, page: Page) -> EmailProviderBase:
        """Create an email provider instance based on the provider type"""
        providers = {
            EmailProvider.GMAIL: GmailProvider,
            EmailProvider.OUTLOOK: OutlookProvider,
            EmailProvider.YAHOO: YahooProvider,
        }
        
        provider_class = providers.get(provider)
        if not provider_class:
            raise ValueError(f"Unsupported email provider: {provider}")
            
        return provider_class(page) 