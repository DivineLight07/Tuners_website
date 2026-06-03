$files = @(
    "public\js\utils.js",
    "public\js\script.js",
    "public\js\admin_dashboard.js",
    "public\js\member_dashboard.js",
    "public\js\about_us.js",
    "public\js\courses.js",
    "public\js\home_page.js",
    "public\js\tuners.js"
)

foreach ($f in $files) {
    $path = Join-Path (Split-Path -Parent $PSScriptRoot) $f
    $content = Get-Content $path -Raw
    $updated = $content -replace 'sessionStorage', 'localStorage'
    Set-Content $path $updated -NoNewline
    Write-Host "Fixed: $f"
}
Write-Host "Done."
