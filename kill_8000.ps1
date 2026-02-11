$port = 8000
$tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($tcp) {
    Write-Host "Found processes on port $port"
    foreach ($conn in $tcp) {
        $pid_to_kill = $conn.OwningProcess
        Write-Host "Killing PID: $pid_to_kill"
        Stop-Process -Id $pid_to_kill -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "No process found on port $port"
}
