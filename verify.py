import asyncio
import httpx
import asyncpg
import redis.asyncio as redis
import time
import sys

async def main():
    print("Waiting for server to start...")
    time.sleep(3)
    
    base_url = "http://127.0.0.1:8000/api/v1/auth"
    async with httpx.AsyncClient(base_url=base_url) as client:
        print("Testing POST /register")
        email = f"test_{int(time.time())}@example.com"
        res = await client.post("/register", json={
            "name": "Test User",
            "email": email,
            "password": "password123"
        })
        if res.status_code != 201:
            print(f"Register failed: {res.status_code} {res.text}")
            sys.exit(1)
        print("Register passed.")
        
        print("Testing POST /login")
        res = await client.post("/login", json={
            "email": email,
            "password": "password123"
        })
        if res.status_code != 200:
            print(f"Login failed: {res.status_code} {res.text}")
            sys.exit(1)
        print("Login passed.")
        
        tokens = res.json()
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]
        
        print("Testing POST /refresh")
        res = await client.post("/refresh", json={
            "refresh_token": refresh_token
        })
        if res.status_code != 200:
            print(f"Refresh failed: {res.status_code} {res.text}")
            sys.exit(1)
        print("Refresh passed.")
        
        new_refresh = res.json()["refresh_token"]
        
        print("Testing POST /logout")
        res = await client.post("/logout", json={
            "refresh_token": new_refresh
        })
        if res.status_code != 200:
            print(f"Logout failed: {res.status_code} {res.text}")
            sys.exit(1)
        print("Logout passed.")

    print("\nVerifying Database and Redis state...")
    
    # Check Postgres
    conn = await asyncpg.connect("postgresql://forensics_user:change_me_in_production@localhost:5432/forensics_db")
    row = await conn.fetchrow("SELECT id, email FROM users WHERE email = $1", email)
    if not row:
        print("PostgreSQL verification failed: User not found in DB.")
        sys.exit(1)
    print(f"PostgreSQL verification passed: User found in DB (ID: {row['id']}).")
    await conn.close()
    
    # Check Redis (Should be empty for this user since we logged out, but we can verify the old token is gone)
    r = redis.from_url("redis://localhost:6379/0", decode_responses=True)
    val = await r.get(f"refresh_token:{new_refresh}")
    if val:
        print("Redis verification failed: Refresh token still exists after logout.")
        sys.exit(1)
    print("Redis verification passed: Refresh token correctly removed on logout.")
    await r.close()
    
    print("\nALL RUNTIME VERIFICATIONS PASSED!")

if __name__ == "__main__":
    asyncio.run(main())
