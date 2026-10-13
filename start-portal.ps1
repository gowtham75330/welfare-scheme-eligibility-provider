Write-Host "Starting Scholarship Portal Services..." -ForegroundColor Cyan

# Start the Backend
Write-Host "--> Starting Node.js Backend Server on port 5001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

# Start the Frontend
Write-Host "--> Starting Vite React Frontend locally..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev -- --host" -WindowStyle Normal

# Wait a few seconds for services to start before generating the tunnel
Write-Host "Waiting for 10 seconds for servers to fully load..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start LocalTunnel for public access
Write-Host "--> Generating Public Link using LocalTunnel..." -ForegroundColor Magenta
Write-Host "A new PowerShell window will open with your public link (Look for 'your url is: https://...')." -ForegroundColor Cyan
Write-Host "You can share that link with other users or open it on your mobile device!" -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Generating Public Link via LocalTunnel...'; npx localtunnel --port 5173" -WindowStyle Normal

Write-Host "All processes started successfully!" -ForegroundColor Green
