$ErrorActionPreference = "Stop"

Write-Host "Starting E2E Test Suite..." -ForegroundColor Cyan

# 1. Start Services
Write-Host "Starting docker-compose services..."
cd ..\..\
docker-compose down -v
docker-compose up -d postgres redis rabbitmq minio
Start-Sleep -Seconds 10

# 2. Start Backend APIs
Write-Host "Starting API Gateway and Auth Service..."
Start-Process -NoNewWindow -FilePath ".venv\Scripts\python.exe" -ArgumentList "-m uvicorn services.auth-service.app.main:app --host 0.0.0.0 --port 8001"
Start-Process -NoNewWindow -FilePath ".venv\Scripts\python.exe" -ArgumentList "-m uvicorn services.api-gateway.app.main:app --host 0.0.0.0 --port 8000"

# 3. Start Stub Consumer
Write-Host "Starting Stub Consumer..."
Start-Process -NoNewWindow -FilePath ".venv\Scripts\python.exe" -ArgumentList "services\stub-consumer\main.py"

# Wait for APIs
Start-Sleep -Seconds 5

# 4. Start Next.js
Write-Host "Starting Frontend..."
cd frontend
Start-Process -NoNewWindow -FilePath "npm.cmd" -ArgumentList "run dev"
cd ..
Start-Sleep -Seconds 10

# 5. Run Verification Scripts
Write-Host "Running Verification Scripts..."
cd tests\e2e
..\..\.venv\Scripts\python.exe verify_phase_d.py

Write-Host "All tests completed!" -ForegroundColor Green
