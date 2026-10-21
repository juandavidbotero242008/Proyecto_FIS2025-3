Add-Type -AssemblyName System.IO.Compression.FileSystem
$filePath = Join-Path $PSScriptRoot "..\historias de usuario.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $filePath))
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$content = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

[xml]$xml = $content
$output = foreach ($p in $xml.document.body.p) {
    $p.InnerText
}
$outputPath = Join-Path $PSScriptRoot "docx-content.txt"
$output | Out-File -FilePath $outputPath -Encoding utf8
Write-Host "DOCX text extracted successfully to $outputPath"
