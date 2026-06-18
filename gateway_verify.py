import asyncio
import httpx
import time
import sys

async def main():
    print("Waiting for both servers to start...")
    time.sleep(4)
    
    base_url = "http://127.0.0.1:8001/api/v1/auth"
    async with httpx.AsyncClient(base_url=base_url) as client:
        print("Testing Gateway POST /register")
        email = f"gw_test_{int(time.time())}@example.com"
        res = await client.post("/register", json={
            "name": "Gateway User",
            "email": email,
            "password": "password123"
        })
        if res.status_code != 201:
            print(f"Register failed: {res.status_code} {res.text}")
            sys.exit(1)
        print("Gateway Register passed.")
        
        print("Testing Gateway POST /login")
        res = await client.post("/login", json={
            "email": email,
            "password": "password123"
        })
        if res.status_code != 200:
            print(f"Login failed: {res.status_code} {res.text}")
            sys.exit(1)
        print("Gateway Login passed.")
        
        tokens = res.json()
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]
        
        print("Testing Gateway GET /me")
        res = await client.get("/me", headers={
            "Authorization": f"Bearer {access_token}"
        })
        if res.status_code != 200:
            print(f"GET /me failed: {res.status_code} {res.text}")
            sys.exit(1)
        
        user_data = res.json()
        if user_data.get("user", {}).get("email") != email:
            print(f"GET /me returned wrong user data: {user_data}")
            sys.exit(1)
        print("Gateway GET /me passed.")
        
        print("Testing Gateway POST /logout")
        res = await client.post("/logout", json={
            "refresh_token": refresh_token
        })
        if res.status_code != 200:
            print(f"Logout failed: {res.status_code} {res.text}")
            sys.exit(1)
        print("Gateway Logout passed.")

    print("\nALL API GATEWAY RUNTIME VERIFICATIONS PASSED!")

if __name__ == "__main__":
    asyncio.run(main())
