# PowerShell script to convert images to base64 and update the hidden gua JSON
$folderPath = "32卦卡片封面"
$jsonPath = "32卦隐藏款.json"

# Read the existing JSON
$jsonContent = Get-Content $jsonPath -Raw
$hiddenGua = $jsonContent | ConvertFrom-Json

# Function to convert image file to base64
function Convert-ImageToBase64 {
    param([string]$imagePath)
    $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $imagePath).Path)
    $base64 = [System.Convert]::ToBase64String($bytes)
    $ext = [System.IO.Path]::GetExtension($imagePath).ToLower()
    
    if ($ext -eq ".png") {
        return "data:image/png;base64,$base64"
    } elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") {
        return "data:image/jpeg;base64,$base64"
    }
    return ""
}

# Map the hidden gua id to image filenames
$idToFileMap = @{
    "01" = "01.png"
    "02" = "02.png"
    "03" = "03.png"
    "04" = "04.png"
    "05" = "05.png"
    "06" = "06.png"
    "07" = "07.png"
    "08" = "08.png"
    "09" = "09.png"
    "10" = "010.png"
    "11" = "011.png"
    "12" = "012.png"
    "13" = "013.png"
    "14" = "014.png"
    "15" = "015.png"
    "16" = "016.png"
    "17" = "017.png"
    "18" = "018.png"
    "19" = "019.png"
    "20" = "020.png"
    "21" = "021.png"
    "22" = "022.png"
    "23" = "023.png"
    "24" = "024.png"
    "25" = "025.png"
    "26" = "026.png"
    "27" = "027.png"
    "28" = "028.png"
    "29" = "029.png"
    "30" = "030.png"
    "31" = "031.png"
    "32" = "00.png"
}

# Process each hidden gua
foreach ($gua in $hiddenGua.h) {
    $id = $gua.id
    if ($idToFileMap.ContainsKey($id)) {
        $imageFile = Join-Path $folderPath $idToFileMap[$id]
        if (Test-Path $imageFile) {
            Write-Host "Converting $imageFile..."
            $base64Image = Convert-ImageToBase64 -imagePath $imageFile
            $gua | Add-Member -NotePropertyName "cardImage" -NotePropertyValue $base64Image -Force
        }
    }
}

# Save the updated JSON
$updatedJson = $hiddenGua | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText((Resolve-Path $jsonPath).Path, $updatedJson, [System.Text.Encoding]::UTF8)

Write-Host "Done! Updated JSON saved to $jsonPath"
