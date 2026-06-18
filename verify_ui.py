import asyncio
from playwright.async_api import async_playwright
import time
import sys

async def main():
    print("Waiting for servers to be fully up...")
    time.sleep(5)
    
    email = f"ui_test_{int(time.time())}@example.com"
    password = "password123"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # 1. Register from UI
        print("Testing UI Register...")
        # First request triggers Next.js compilation which can be very slow
        await page.goto("http://localhost:3000/register", timeout=120000)
        await page.fill('input[name="name"]', "UI Test User")
        await page.fill('input[name="email"]', email)
        await page.fill('input[name="password"]', password)
        await page.fill('input[name="confirmPassword"]', password)
        await page.click('button[type="submit"]')
        
        # Wait for redirect to login
        await page.wait_for_url("**/login*")
        print("UI Register passed.")

        # 2. Login from UI
        print("Testing UI Login...")
        await page.fill('input[name="email"]', email)
        await page.fill('input[name="password"]', password)
        await page.click('button[type="submit"]')

        # 3. Access protected route
        # Wait for redirect to dashboard
        await page.wait_for_url("**/dashboard*")
        print("UI Login passed.")
        
        # Verify dashboard content
        await page.wait_for_selector("text=Welcome to your dashboard!")
        await page.wait_for_selector(f"text={email}")
        print("UI Protected Route Access passed.")

        # 4. Logout flow
        print("Testing UI Logout...")
        await page.click("text=Logout")
        await page.wait_for_url("**/login*")
        
        # Verify protected route blocks access after logout
        await page.goto("http://localhost:3000/dashboard")
        await page.wait_for_url("**/login*")
        print("UI Logout passed.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
