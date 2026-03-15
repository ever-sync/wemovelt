param(
    [ValidateSet("bundleRelease", "assembleRelease")]
    [string]$Task = "bundleRelease"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $repoRoot "android"
$keystorePropertiesPath = Join-Path $androidDir "keystore.properties"

function Resolve-ExistingPath {
    param([string[]]$Candidates)

    foreach ($candidate in $Candidates) {
        if ($candidate -and (Test-Path $candidate)) {
            return $candidate
        }
    }

    return $null
}

function Test-ReleaseSigningConfigured {
    if (Test-Path $keystorePropertiesPath) {
        return $true
    }

    return [bool](
        $env:ANDROID_KEYSTORE_PATH -and
        $env:ANDROID_KEYSTORE_PASSWORD -and
        $env:ANDROID_KEY_ALIAS -and
        $env:ANDROID_KEY_PASSWORD
    )
}

$javaHome = Resolve-ExistingPath @(
    $env:JAVA_HOME,
    "C:\Program Files\Android\Android Studio\jbr",
    "C:\Program Files\Android\Android Studio\jre"
)

if (-not $javaHome) {
    throw "JAVA_HOME nao encontrado. Instale o Android Studio ou defina JAVA_HOME."
}

$androidSdk = Resolve-ExistingPath @(
    $env:ANDROID_HOME,
    $env:ANDROID_SDK_ROOT,
    (Join-Path $env:LOCALAPPDATA "Android\Sdk")
)

if (-not $androidSdk) {
    throw "Android SDK nao encontrado. Defina ANDROID_HOME ou instale o SDK do Android Studio."
}

if (-not (Test-ReleaseSigningConfigured)) {
    throw "Assinatura de release nao configurada. Crie android\\keystore.properties ou defina ANDROID_KEYSTORE_PATH, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS e ANDROID_KEY_PASSWORD."
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidSdk
$env:ANDROID_SDK_ROOT = $androidSdk
$env:Path = "$javaHome\bin;$androidSdk\platform-tools;$env:Path"

Push-Location $repoRoot
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Falha no build web."
    }

    npx cap sync android
    if ($LASTEXITCODE -ne 0) {
        throw "Falha no sync do Capacitor para Android."
    }

    Push-Location $androidDir
    try {
        & .\gradlew.bat $Task
        if ($LASTEXITCODE -ne 0) {
            throw "Falha no Gradle task $Task."
        }
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
