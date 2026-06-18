$ErrorActionPreference = "Stop"

Write-Host "Starting Auth Service..."
$env:JWT_SECRET_KEY="supersecretkey"
$env:PYTHONPATH="d:\Final_year_project\multi-modal-ai-content-forensics"
$authProcess = Start-Process "d:\Final_year_project\multi-modal-ai-content-forensics\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --port 8000" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\services\auth-service" -PassThru -NoNewWindow

Write-Host "Starting API Gateway..."
$env:PYTHONPATH="d:\Final_year_project\multi-modal-ai-content-forensics"
$gatewayProcess = Start-Process "d:\Final_year_project\multi-modal-ai-content-forensics\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --port 8001" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\services\api-gateway" -PassThru -NoNewWindow

Write-Host "Starting Stub Consumer..."
$env:PYTHONPATH="d:\Final_year_project\multi-modal-ai-content-forensics"
$stubProcess = Start-Process "d:\Final_year_project\multi-modal-ai-content-forensics\.venv\Scripts\python.exe" -ArgumentList "main.py" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\services\stub-consumer" -PassThru -NoNewWindow

Write-Host "Building Frontend..."
Start-Process "cmd.exe" -ArgumentList "/c npm run build" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\frontend" -Wait -NoNewWindow

Write-Host "Starting Frontend..."
$frontendProcess = Start-Process "cmd.exe" -ArgumentList "/c npm run start" -WorkingDirectory "d:\Final_year_project\multi-modal-ai-content-forensics\frontend" -PassThru -NoNewWindow

Write-Host "Waiting for servers to start..."
Start-Sleep -Seconds 15

Write-Host "Running Phase D Verification..."
try {
    .\.venv\Scripts\python.exe verify_phase_d.py
} finally {
    Write-Host "Cleaning up processes..."
    Stop-Process -Id $authProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $gatewayProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $stubProcess.Id -Force -ErrorAction SilentlyContinue
    # Terminate the frontend node process tree
    taskkill /F /T /PID $frontendProcess.Id | Out-Null
}
