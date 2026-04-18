# 图片压缩脚本
# 压缩项目中的所有图片，减小文件大小

Write-Host "=== 开始压缩图片 ===" -ForegroundColor Green

Add-Type -AssemblyName System.Drawing

function Compress-Jpeg {
    param(
        [string]$InputPath,
        [long]$Quality = 75L
    )
    
    try {
        $img = [System.Drawing.Image]::FromFile($InputPath)
        
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $Quality)
        
        $codecInfo = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
        
        $tempPath = $InputPath + ".tmp.jpg"
        $img.Save($tempPath, $codecInfo, $encoderParams)
        $img.Dispose()
        
        Remove-Item $InputPath -Force
        Move-Item $tempPath $InputPath -Force
        
        return $true
    }
    catch {
        Write-Host "压缩失败: $InputPath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Compress-Png {
    param(
        [string]$InputPath
    )
    
    try {
        $img = [System.Drawing.Image]::FromFile($InputPath)
        
        $tempPath = $InputPath + ".tmp.png"
        
        # 使用默认质量保存 PNG
        $img.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()
        
        # 检查是否真的变小了
        $originalSize = (Get-Item $InputPath).Length
        $newSize = (Get-Item $tempPath).Length
        
        if ($newSize -lt $originalSize) {
            Remove-Item $InputPath -Force
            Move-Item $tempPath $InputPath -Force
            return $true
        } else {
            Remove-Item $tempPath -Force
            return $false
        }
    }
    catch {
        Write-Host "压缩失败: $InputPath - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 记录原始大小
$originalSize64 = (Get-ChildItem -Path "64卦卡片封面" -File | Measure-Object -Property Length -Sum).Sum
$originalSize32 = (Get-ChildItem -Path "32卦卡片封面" -File -Filter "*.png" | Measure-Object -Property Length -Sum).Sum
$originalSizeBg = (Get-Item "background.png").Length
$totalOriginal = $originalSize64 + $originalSize32 + $originalSizeBg

Write-Host "`n原始大小:" -ForegroundColor Yellow
Write-Host "  64卦卡片封面: $([math]::Round($originalSize64/1MB, 2)) MB"
Write-Host "  32卦卡片封面: $([math]::Round($originalSize32/1MB, 2)) MB"
Write-Host "  background.png: $([math]::Round($originalSizeBg/1MB, 2)) MB"
Write-Host "  总计: $([math]::Round($totalOriginal/1MB, 2)) MB"

Write-Host "`n开始压缩 64卦卡片封面 图片..." -ForegroundColor Cyan
$count64 = 0
Get-ChildItem -Path "64卦卡片封面" -File -Filter "*.jpg" | ForEach-Object {
    Write-Host "  压缩: $($_.Name)" -NoNewline
    if (Compress-Jpeg -InputPath $_.FullName -Quality 75) {
        $count64++
        Write-Host " ✓" -ForegroundColor Green
    } else {
        Write-Host " ✗" -ForegroundColor Red
    }
}

Write-Host "`n开始压缩 32卦卡片封面 图片..." -ForegroundColor Cyan
$count32 = 0
Get-ChildItem -Path "32卦卡片封面" -File -Filter "*.png" | ForEach-Object {
    Write-Host "  压缩: $($_.Name)" -NoNewline
    if (Compress-Png -InputPath $_.FullName) {
        $count32++
        Write-Host " ✓" -ForegroundColor Green
    } else {
        Write-Host " (无变化)" -ForegroundColor Gray
    }
}

Write-Host "`n开始压缩 background.png..." -ForegroundColor Cyan
Write-Host "  压缩: background.png" -NoNewline
if (Compress-Png -InputPath "background.png") {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " (无变化)" -ForegroundColor Gray
}

# 计算压缩后大小
$finalSize64 = (Get-ChildItem -Path "64卦卡片封面" -File | Measure-Object -Property Length -Sum).Sum
$finalSize32 = (Get-ChildItem -Path "32卦卡片封面" -File -Filter "*.png" | Measure-Object -Property Length -Sum).Sum
$finalSizeBg = (Get-Item "background.png").Length
$totalFinal = $finalSize64 + $finalSize32 + $finalSizeBg
$savings = $totalOriginal - $totalFinal
$savingsPercent = [math]::Round(($savings / $totalOriginal) * 100, 2)

Write-Host "`n=== 压缩完成 ===" -ForegroundColor Green
Write-Host "`n压缩后大小:" -ForegroundColor Yellow
Write-Host "  64卦卡片封面: $([math]::Round($finalSize64/1MB, 2)) MB (节省 $([math]::Round(($originalSize64-$finalSize64)/1MB, 2)) MB)"
Write-Host "  32卦卡片封面: $([math]::Round($finalSize32/1MB, 2)) MB (节省 $([math]::Round(($originalSize32-$finalSize32)/1MB, 2)) MB)"
Write-Host "  background.png: $([math]::Round($finalSizeBg/1MB, 2)) MB (节省 $([math]::Round(($originalSizeBg-$finalSizeBg)/1MB, 2)) MB)"
Write-Host "  总计: $([math]::Round($totalFinal/1MB, 2)) MB"
Write-Host "`n总共节省: $([math]::Round($savings/1MB, 2)) MB ($savingsPercent%)" -ForegroundColor Green
Write-Host "`n完成!" -ForegroundColor Green
