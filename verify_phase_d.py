import asyncio
from playwright.async_api import async_playwright
import os
import httpx

FRONTEND_URL = "http://localhost:3000"
AUTH_SERVICE_URL = "http://localhost:8001/api/v1/auth"

async def create_test_files():
    # 1. Valid PNG
    with open("test_valid.png", "wb") as f:
        # A tiny valid 1x1 PNG
        f.write(b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfe\xa7\x35\x81\x84\x00\x00\x00\x00IEND\xaeB`\x82')
    
    # 2. Invalid TXT
    with open("test_invalid.txt", "w") as f:
        f.write("This is not an image.")
        
    # 3. Oversized PNG (> 20 MB)
    with open("test_oversized.png", "wb") as f:
        f.seek(21 * 1024 * 1024)
        f.write(b'\x00')

async def main():
    await create_test_files()
    
    # Register user via API directly
    async with httpx.AsyncClient() as client:
        await client.post(f"{AUTH_SERVICE_URL}/register", json={
            "name": "Phase D User",
            "email": "phased_user@test.com",
            "password": "StrongPassword123!"
        })

    print("Starting Playwright verification...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # 1. Login
        print("Navigating to login...")
        await page.goto(f"{FRONTEND_URL}/login")
        await page.fill("input[type='email']", "phased_user@test.com")
        await page.fill("input[type='password']", "StrongPassword123!")
        await page.click("button[type='submit']")
        
        # Wait for dashboard to load
        await page.wait_for_selector("text=Forensics Dashboard")
        print("Logged in successfully.")

        # 2. Verify invalid file rejection
        print("Testing invalid file upload...")
        # In react-dropzone, we can set files on the hidden input
        file_input = page.locator("input[type='file']")
        await file_input.set_input_files("test_invalid.txt")
        await page.wait_for_selector("text=Invalid file type", timeout=5000)
        print("Invalid file successfully rejected!")

        # 3. Verify oversized file rejection
        print("Testing oversized file upload...")
        await file_input.set_input_files("test_oversized.png")
        await page.wait_for_selector("text=File exceeds the maximum limit", timeout=5000)
        print("Oversized file successfully rejected!")

        # 4. Verify valid upload and transitions
        print("Testing valid upload and status transitions...")
        # Clear existing error first by selecting a valid file but it auto uploads
        await file_input.set_input_files("test_valid.png")
        
        # It should show QUEUED
        await page.wait_for_selector("text=queued", timeout=5000)
        print("Observed QUEUED status in UI!")
        
        # It should show PROCESSING
        await page.wait_for_selector("text=processing", timeout=10000)
        print("Observed PROCESSING status in UI!")
        
        # It should show COMPLETED
        await page.wait_for_selector("text=completed", timeout=15000)
        print("Observed COMPLETED status in UI!")
        
        print("\nALL PHASE D RUNTIME VERIFICATIONS PASSED!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
