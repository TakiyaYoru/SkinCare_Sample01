@echo off
echo ==========================================
echo   Sample 01 - Local Web Server (PowerShell)
echo ==========================================
echo.
echo Starting server on http://localhost:8080
echo Press Ctrl+C to stop.
echo.
powershell -ExecutionPolicy Bypass -Command ^
  "$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8080/'); $listener.Start(); Write-Host 'Server started at http://localhost:8080 - Open this in your browser'; Write-Host 'Press Ctrl+C to stop.'; $root = Split-Path -Parent $MyInvocation.MyCommand.Path; while ($listener.IsListening) { $ctx = $listener.GetContext(); $req = $ctx.Request; $res = $ctx.Response; $path = $req.Url.LocalPath; if ($path -eq '/') { $path = '/index.html' }; $file = Join-Path $root $path.TrimStart('/'); $file = $file.Replace('%20',' ').Replace('%26','&').Replace('%40','@'); if (Test-Path $file -PathType Leaf) { $ext = [System.IO.Path]::GetExtension($file).ToLower(); $mime = switch ($ext) { '.html' {'text/html; charset=utf-8'} '.css' {'text/css'} '.js' {'application/javascript'} '.json' {'application/json'} '.png' {'image/png'} '.jpg' {'image/jpeg'} '.jpeg' {'image/jpeg'} '.gif' {'image/gif'} '.svg' {'image/svg+xml'} '.ico' {'image/x-icon'} '.woff' {'font/woff'} '.woff2' {'font/woff2'} '.ttf' {'font/ttf'} '.webp' {'image/webp'} default {'application/octet-stream'} }; $bytes = [System.IO.File]::ReadAllBytes($file); $res.ContentType = $mime; $res.ContentLength64 = $bytes.Length; $res.OutputStream.Write($bytes, 0, $bytes.Length) } else { $res.StatusCode = 404; $msg = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found'); $res.OutputStream.Write($msg, 0, $msg.Length) }; $res.Close() }"

pause
