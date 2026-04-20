# Meditrack Pro - Build APK Script
# Run this AFTER installing Android Studio which includes JDK + Android SDK

# Step 1: Rebuild the web app freshly
Write-Host "Building web app..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\.."
npm run build

# Step 2: Sync to Android
Write-Host "Syncing to Android..." -ForegroundColor Cyan
npx cap sync android

# Step 3: Build debug APK using Gradle
Write-Host "Building APK..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\android"
.\gradlew.bat assembleDebug

# Step 4: Show result
$apk = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
    $fullPath = Resolve-Path $apk
    Write-Host ""
    Write-Host "✅ APK built successfully!" -ForegroundColor Green
    Write-Host "📱 APK location: $fullPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Transfer this file to your phone and install it." -ForegroundColor Cyan
    # Open the folder automatically
    explorer.exe (Split-Path $fullPath)
} else {
    Write-Host "❌ Build failed. Make sure Android Studio is installed." -ForegroundColor Red
}
