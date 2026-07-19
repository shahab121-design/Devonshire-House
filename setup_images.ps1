# Run this script to copy generated images to the project folder
# PowerShell: .\setup_images.ps1

$source = "C:\Users\user\.gemini\antigravity-ide\brain\d0b7dc37-9053-4607-8e64-0dc3c475b78d"
$dest = "c:\Users\user\Documents\Antigravity\Devonshire House\assets\images"

# Ensure destination exists
if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force
}

$images = @{
    "hero_bg_1783623301163.png" = "hero_bg.png"
    "about_jilla_1783623315162.png" = "about_jilla.png"
    "treatment_electro_1783623323811.png" = "treatment_electro.png"
    "treatment_zo_skin_1783623341060.png" = "treatment_zo_skin.png"
    "treatment_mens_1783623352720.png" = "treatment_mens.png"
    "treatment_mca_1783623361993.png" = "treatment_mca.png"
    "treatment_dermaroller_1783623381829.png" = "treatment_dermaroller.png"
    "treatment_lipoglaze_1783623393014.png" = "treatment_lipoglaze.png"
    "favicon_1783623851315.png" = "favicon.png"
}

foreach ($entry in $images.GetEnumerator()) {
    $srcFile = Join-Path $source $entry.Key
    $destFile = Join-Path $dest $entry.Value
    if (Test-Path $srcFile) {
        Copy-Item $srcFile $destFile -Force
        Write-Host "Copied: $($entry.Value)" -ForegroundColor Green
    } else {
        Write-Host "NOT FOUND: $($entry.Key)" -ForegroundColor Red
    }
}

Write-Host "`nDone! All images copied to $dest" -ForegroundColor Cyan
