# CaterHub - Start All Services
# Run this script from PowerShell: .\start-all.ps1

Write-Host "`n🧹 Cleaning up stale processes..." -ForegroundColor Yellow

# Kill anything on our ports
@(3000, 3001, 3002, 3003, 5173, 5174) | ForEach-Object {
    $port = $_
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        Select-Object OwningProcess -Unique |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

Start-Sleep -Seconds 2

Write-Host "🚀 Starting Backend API (port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:\antigravity\catering\online-catering\backend'; npm run start:dev" -WindowStyle Normal

Start-Sleep -Seconds 5

Write-Host "🎨 Starting Admin Panel..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:\antigravity\catering\online-catering\admin-panel'; npm run dev" -WindowStyle Normal

Write-Host "🌐 Starting Customer Site (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:\antigravity\catering\online-catering\customer-site'; npm run dev" -WindowStyle Normal

Write-Host "👨‍🍳 Starting Caterer Site (port 3003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'e:\antigravity\catering\online-catering\caterer-site'; set PORT=3003; npm run dev -- -p 3003" -WindowStyle Normal

Write-Host "`n✅ All services launching! Give them ~10 seconds to boot up." -ForegroundColor Green
Write-Host ""
Write-Host "  Backend API   → http://localhost:3001" -ForegroundColor White
Write-Host "  Customer Site → http://localhost:3000" -ForegroundColor White
Write-Host "  Admin Panel   → http://localhost:5173" -ForegroundColor White
Write-Host "  Caterer Site  → http://localhost:3003" -ForegroundColor White
Write-Host ""
