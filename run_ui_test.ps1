$ErrorActionPreference = "Stop"

Write-Host "Installing playwright..."
.\.venv\Scripts\pip.exe install playwright
.\.venv\Scripts\playwright.exe install chromium

Write-Host "Starting Auth Service..."
$env:JWT_SECRET_KEY="supersecretkey"
$env:PYTHONPATH="d:\Final_year_project\multi-modal-ai-content-forensics"
$authProcess = Start-Process "d:\Final_year_project\multi-modal-ai-content-forensics\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --port 8000" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\services\auth-service" -PassThru -NoNewWindow

Write-Host "Starting API Gateway..."
$env:PYTHONPATH="d:\Final_year_project\multi-modal-ai-content-forensics"
$gatewayProcess = Start-Process "d:\Final_year_project\multi-modal-ai-content-forensics\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --port 8001" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\services\api-gateway" -PassThru -NoNewWindow

Write-Host "Starting Frontend Next.js Server..."
$env:NEXT_PUBLIC_API_URL="http://127.0.0.1:8001/api/v1"
$frontendProcess = Start-Process "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\frontend" -PassThru -NoNewWindow

Write-Host "Waiting for all servers to initialize (15s)..."
Start-Sleep -Seconds 15

Write-Host "Running UI Verification..."
try {
    .\.venv\Scripts\python.exe verify_ui.py
} finally {
    Write-Host "Cleaning up processes..."
    Stop-Process -Id $authProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $gatewayProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
}
