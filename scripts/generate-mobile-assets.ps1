Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-Canvas {
    param(
        [int]$Width,
        [int]$Height
    )

    return New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
}

function Initialize-Graphics {
    param(
        [System.Drawing.Graphics]$Graphics
    )

    $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $Graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
}

function Save-Png {
    param(
        [System.Drawing.Bitmap]$Bitmap,
        [string]$Path
    )

    $directory = Split-Path -Parent $Path
    if ($directory) {
        New-Item -ItemType Directory -Force -Path $directory | Out-Null
    }

    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function New-Font {
    param(
        [float]$Size,
        [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Bold
    )

    $preferredFamilies = @("Arial", "Segoe UI", "Verdana")

    foreach ($family in $preferredFamilies) {
        try {
            return New-Object System.Drawing.Font($family, $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
        }
        catch {
        }
    }

    return New-Object System.Drawing.Font([System.Drawing.FontFamily]::GenericSansSerif, $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
}

function Fill-AppBackground {
    param(
        [System.Drawing.Graphics]$Graphics,
        [int]$Width,
        [int]$Height
    )

    $rectangle = New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rectangle,
        [System.Drawing.ColorTranslator]::FromHtml("#070707"),
        [System.Drawing.ColorTranslator]::FromHtml("#15100c"),
        90.0
    )

    try {
        $Graphics.FillRectangle($brush, $rectangle)
    }
    finally {
        $brush.Dispose()
    }

    $topGlow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 255, 102, 0))
    $bottomGlow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(18, 255, 139, 45))

    try {
        $Graphics.FillEllipse($topGlow, -($Width * 0.15), -($Height * 0.22), $Width * 1.3, $Height * 0.72)
        $Graphics.FillEllipse($bottomGlow, -($Width * 0.1), $Height * 0.64, $Width * 1.2, $Height * 0.42)
    }
    finally {
        $topGlow.Dispose()
        $bottomGlow.Dispose()
    }
}

function Draw-Badge {
    param(
        [System.Drawing.Graphics]$Graphics,
        [int]$CanvasWidth,
        [int]$CanvasHeight,
        [double]$Scale = 1.0,
        [switch]$TransparentBackground
    )

    $size = [Math]::Min($CanvasWidth, $CanvasHeight) * $Scale
    $diameter = [float]$size
    $x = [float](($CanvasWidth - $diameter) / 2.0)
    $y = [float](($CanvasHeight - $diameter) / 2.0)
    $ellipse = New-Object System.Drawing.RectangleF($x, $y, $diameter, $diameter)

    if (-not $TransparentBackground) {
        $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(70, 255, 102, 0))
        try {
            $Graphics.FillEllipse($shadowBrush, $x - ($diameter * 0.04), $y + ($diameter * 0.08), $diameter * 1.08, $diameter * 1.08)
        }
        finally {
            $shadowBrush.Dispose()
        }
    }

    $gradientBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Rectangle([int]$x, [int]$y, [int]$diameter, [int]$diameter)),
        [System.Drawing.ColorTranslator]::FromHtml("#ff6a00"),
        [System.Drawing.ColorTranslator]::FromHtml("#ff8f2a"),
        45.0
    )

    try {
        $Graphics.FillEllipse($gradientBrush, $ellipse)
    }
    finally {
        $gradientBrush.Dispose()
    }

    $highlightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(46, 255, 255, 255))
    try {
        $Graphics.FillEllipse(
            $highlightBrush,
            $x + ($diameter * 0.18),
            $y + ($diameter * 0.08),
            $diameter * 0.46,
            $diameter * 0.24
        )
    }
    finally {
        $highlightBrush.Dispose()
    }

    $font = New-Font -Size ([float]($diameter * 0.34))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $format.FormatFlags = [System.Drawing.StringFormatFlags]::NoWrap
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#111111"))

    try {
        $Graphics.DrawString("WM", $font, $brush, $ellipse, $format)
    }
    finally {
        $brush.Dispose()
        $format.Dispose()
        $font.Dispose()
    }
}

function Draw-Wordmark {
    param(
        [System.Drawing.Graphics]$Graphics,
        [int]$CanvasWidth,
        [int]$CanvasHeight
    )

    $centerX = $CanvasWidth / 2.0
    $baseY = $CanvasHeight / 2.0 + ($CanvasHeight * 0.16)

    $titleFont = New-Font -Size ([float]($CanvasHeight * 0.054))
    $subtitleFont = New-Font -Size ([float]($CanvasHeight * 0.024)) -Style ([System.Drawing.FontStyle]::Bold)
    $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $subtitleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#ff8b2d"))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    try {
        $subtitlePoint = [System.Drawing.PointF]::new([float]$centerX, [float]($baseY - ($CanvasHeight * 0.045)))
        $titlePoint = [System.Drawing.PointF]::new([float]$centerX, [float]$baseY)
        $Graphics.DrawString("OUTDOOR FITNESS", $subtitleFont, $subtitleBrush, $subtitlePoint, $format)
        $Graphics.DrawString("WEMOVELT", $titleFont, $titleBrush, $titlePoint, $format)
    }
    finally {
        $format.Dispose()
        $subtitleBrush.Dispose()
        $titleBrush.Dispose()
        $subtitleFont.Dispose()
        $titleFont.Dispose()
    }
}

function New-IconImage {
    param(
        [int]$Size,
        [string]$Path
    )

    $bitmap = New-Canvas -Width $Size -Height $Size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
        Initialize-Graphics -Graphics $graphics
        Fill-AppBackground -Graphics $graphics -Width $Size -Height $Size
        Draw-Badge -Graphics $graphics -CanvasWidth $Size -CanvasHeight $Size -Scale 0.62
        Save-Png -Bitmap $bitmap -Path $Path
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

function New-AdaptiveForegroundImage {
    param(
        [int]$Size,
        [string]$Path
    )

    $bitmap = New-Canvas -Width $Size -Height $Size
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
        Initialize-Graphics -Graphics $graphics
        $graphics.Clear([System.Drawing.Color]::Transparent)
        Draw-Badge -Graphics $graphics -CanvasWidth $Size -CanvasHeight $Size -Scale 0.58 -TransparentBackground
        Save-Png -Bitmap $bitmap -Path $Path
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

function New-SplashImage {
    param(
        [int]$Width,
        [int]$Height,
        [string]$Path
    )

    $bitmap = New-Canvas -Width $Width -Height $Height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

    try {
        Initialize-Graphics -Graphics $graphics
        Fill-AppBackground -Graphics $graphics -Width $Width -Height $Height
        Draw-Badge -Graphics $graphics -CanvasWidth $Width -CanvasHeight ([int]($Height * 0.72)) -Scale 0.22
        Draw-Wordmark -Graphics $graphics -CanvasWidth $Width -CanvasHeight $Height
        Save-Png -Bitmap $bitmap -Path $Path
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

$iconTargets = @(
    @{ Path = "public\favicon.png"; Size = 256; Type = "icon" },
    @{ Path = "public\icon-180.png"; Size = 180; Type = "icon" },
    @{ Path = "public\icon-192.png"; Size = 192; Type = "icon" },
    @{ Path = "public\icon-512.png"; Size = 512; Type = "icon" },
    @{ Path = "public\logo-mark.png"; Size = 1024; Type = "icon" },
    @{ Path = "public\logo-mark-1024.png"; Size = 1024; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-mdpi\ic_launcher.png"; Size = 48; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png"; Size = 48; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-mdpi\ic_launcher_foreground.png"; Size = 108; Type = "foreground" },
    @{ Path = "android\app\src\main\res\mipmap-hdpi\ic_launcher.png"; Size = 72; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png"; Size = 72; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-hdpi\ic_launcher_foreground.png"; Size = 162; Type = "foreground" },
    @{ Path = "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png"; Size = 96; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png"; Size = 96; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-xhdpi\ic_launcher_foreground.png"; Size = 216; Type = "foreground" },
    @{ Path = "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png"; Size = 144; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png"; Size = 144; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_foreground.png"; Size = 324; Type = "foreground" },
    @{ Path = "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"; Size = 192; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png"; Size = 192; Type = "icon" },
    @{ Path = "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_foreground.png"; Size = 432; Type = "foreground" },
    @{ Path = "ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png"; Size = 1024; Type = "icon" }
)

$splashTargets = @(
    @{ Path = "android\app\src\main\res\drawable\splash.png"; Width = 480; Height = 320 },
    @{ Path = "android\app\src\main\res\drawable-land-mdpi\splash.png"; Width = 480; Height = 320 },
    @{ Path = "android\app\src\main\res\drawable-land-hdpi\splash.png"; Width = 800; Height = 480 },
    @{ Path = "android\app\src\main\res\drawable-land-xhdpi\splash.png"; Width = 1280; Height = 720 },
    @{ Path = "android\app\src\main\res\drawable-land-xxhdpi\splash.png"; Width = 1600; Height = 960 },
    @{ Path = "android\app\src\main\res\drawable-land-xxxhdpi\splash.png"; Width = 1920; Height = 1280 },
    @{ Path = "android\app\src\main\res\drawable-port-mdpi\splash.png"; Width = 320; Height = 480 },
    @{ Path = "android\app\src\main\res\drawable-port-hdpi\splash.png"; Width = 480; Height = 800 },
    @{ Path = "android\app\src\main\res\drawable-port-xhdpi\splash.png"; Width = 720; Height = 1280 },
    @{ Path = "android\app\src\main\res\drawable-port-xxhdpi\splash.png"; Width = 960; Height = 1600 },
    @{ Path = "android\app\src\main\res\drawable-port-xxxhdpi\splash.png"; Width = 1280; Height = 1920 },
    @{ Path = "ios\App\App\Assets.xcassets\Splash.imageset\splash-2732x2732.png"; Width = 2732; Height = 2732 },
    @{ Path = "ios\App\App\Assets.xcassets\Splash.imageset\splash-2732x2732-1.png"; Width = 2732; Height = 2732 },
    @{ Path = "ios\App\App\Assets.xcassets\Splash.imageset\splash-2732x2732-2.png"; Width = 2732; Height = 2732 }
)

foreach ($target in $iconTargets) {
    if ($target.Type -eq "foreground") {
        New-AdaptiveForegroundImage -Size $target.Size -Path $target.Path
    }
    else {
        New-IconImage -Size $target.Size -Path $target.Path
    }
}

foreach ($target in $splashTargets) {
    New-SplashImage -Width $target.Width -Height $target.Height -Path $target.Path
}
