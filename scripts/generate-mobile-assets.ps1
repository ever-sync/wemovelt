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

function New-RoundedRectanglePath {
    param(
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Radius
    )

    $diameter = $Radius * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath

    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()

    return $path
}

function Draw-BrandMark {
    param(
        [System.Drawing.Graphics]$Graphics,
        [int]$CanvasWidth,
        [int]$CanvasHeight,
        [double]$Scale = 1.0,
        [double]$Rotation = -32.0
    )

    $unitScale = ([Math]::Min($CanvasWidth, $CanvasHeight) / 32.0) * $Scale
    $matrix = $Graphics.Transform.Clone()
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

    try {
        $Graphics.TranslateTransform($CanvasWidth / 2.0, $CanvasHeight / 2.0)
        $Graphics.RotateTransform([float]$Rotation)
        $Graphics.ScaleTransform([float]$unitScale, [float]$unitScale)
        $Graphics.TranslateTransform(-16.0, -16.0)

        $shapes = @(
            @{ X = 7.0; Y = 14.5; Width = 18.0; Height = 3.0; Radius = 1.5 },
            @{ X = 5.0; Y = 12.0; Width = 2.5; Height = 8.0; Radius = 1.0 },
            @{ X = 8.0; Y = 10.5; Width = 3.0; Height = 11.0; Radius = 1.0 },
            @{ X = 21.0; Y = 10.5; Width = 3.0; Height = 11.0; Radius = 1.0 },
            @{ X = 24.5; Y = 12.0; Width = 2.5; Height = 8.0; Radius = 1.0 }
        )

        foreach ($shape in $shapes) {
            $path = New-RoundedRectanglePath -X $shape.X -Y $shape.Y -Width $shape.Width -Height $shape.Height -Radius $shape.Radius
            try {
                $Graphics.FillPath($brush, $path)
            }
            finally {
                $path.Dispose()
            }
        }
    }
    finally {
        $Graphics.Transform = $matrix
        $matrix.Dispose()
        $brush.Dispose()
    }
}

function Fill-BrandBackground {
    param(
        [int]$Width,
        [int]$Height,
        [System.Drawing.Graphics]$Graphics
    )

    $rectangle = New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)
    $startColor = [System.Drawing.ColorTranslator]::FromHtml("#ff4338")
    $endColor = [System.Drawing.ColorTranslator]::FromHtml("#ff9a4f")
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectangle, $startColor, $endColor, 0.0)

    try {
        $Graphics.FillRectangle($brush, $rectangle)
    }
    finally {
        $brush.Dispose()
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
        Fill-BrandBackground -Width $Size -Height $Size -Graphics $graphics
        Draw-BrandMark -Graphics $graphics -CanvasWidth $Size -CanvasHeight $Size -Scale 0.72
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
        Fill-BrandBackground -Width $Width -Height $Height -Graphics $graphics
        Draw-BrandMark -Graphics $graphics -CanvasWidth $Width -CanvasHeight $Height -Scale 0.34
        Save-Png -Bitmap $bitmap -Path $Path
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

$iconTargets = @(
    @{ Path = "android\app\src\main\res\mipmap-mdpi\ic_launcher.png"; Size = 48 },
    @{ Path = "android\app\src\main\res\mipmap-mdpi\ic_launcher_round.png"; Size = 48 },
    @{ Path = "android\app\src\main\res\mipmap-mdpi\ic_launcher_foreground.png"; Size = 108 },
    @{ Path = "android\app\src\main\res\mipmap-hdpi\ic_launcher.png"; Size = 72 },
    @{ Path = "android\app\src\main\res\mipmap-hdpi\ic_launcher_round.png"; Size = 72 },
    @{ Path = "android\app\src\main\res\mipmap-hdpi\ic_launcher_foreground.png"; Size = 162 },
    @{ Path = "android\app\src\main\res\mipmap-xhdpi\ic_launcher.png"; Size = 96 },
    @{ Path = "android\app\src\main\res\mipmap-xhdpi\ic_launcher_round.png"; Size = 96 },
    @{ Path = "android\app\src\main\res\mipmap-xhdpi\ic_launcher_foreground.png"; Size = 216 },
    @{ Path = "android\app\src\main\res\mipmap-xxhdpi\ic_launcher.png"; Size = 144 },
    @{ Path = "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_round.png"; Size = 144 },
    @{ Path = "android\app\src\main\res\mipmap-xxhdpi\ic_launcher_foreground.png"; Size = 324 },
    @{ Path = "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"; Size = 192 },
    @{ Path = "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_round.png"; Size = 192 },
    @{ Path = "android\app\src\main\res\mipmap-xxxhdpi\ic_launcher_foreground.png"; Size = 432 },
    @{ Path = "ios\App\App\Assets.xcassets\AppIcon.appiconset\AppIcon-512@2x.png"; Size = 1024 }
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
    New-IconImage -Size $target.Size -Path $target.Path
}

foreach ($target in $splashTargets) {
    New-SplashImage -Width $target.Width -Height $target.Height -Path $target.Path
}
