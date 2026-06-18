$ErrorActionPreference = "Stop"

Write-Host "Starting Auth Service..."
$env:JWT_SECRET_KEY="supersecretkey"
$env:PYTHONPATH="d:\Final_year_project\multi-modal-ai-content-forensics"
$authProcess = Start-Process "d:\Final_year_project\multi-modal-ai-content-forensics\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --port 8000" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\services\auth-service" -PassThru -NoNewWindow

Write-Host "Starting API Gateway..."
$env:PYTHONPATH="d:\Final_year_project\multi-modal-ai-content-forensics"
$gatewayProcess = Start-Process "d:\Final_year_project\multi-modal-ai-content-forensics\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --port 8001" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\services\api-gateway" -PassThru -NoNewWindow

Write-Host "Waiting for servers..."
Start-Sleep -Seconds 10

Write-Host "Running Phase B Verification..."
try {
    .\.venv\Scripts\python.exe verify_phase_b.py
} finally {
    Write-Host "Cleaning up processes..."
    Stop-Process -Id $authProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $gatewayProcess.Id -Force -ErrorAction SilentlyContinue
}
