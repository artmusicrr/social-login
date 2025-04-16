# Script para download de vídeos do YouTube usando yt-dlp no Windows
# Uso: .\baixar-video.ps1 [URL] [FORMATO] [CAMINHO_SAIDA]

param (
    [Parameter(Mandatory=$true)]
    [string]$VideoUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$FormatId,
    
    [Parameter(Mandatory=$true)]
    [string]$OutputPath
)

# Verifica se o yt-dlp está instalado
try {
    $ytdlpVersion = & yt-dlp --version
    Write-Host "yt-dlp versão: $ytdlpVersion"
} catch {
    Write-Host "Erro: yt-dlp não está instalado. Instale com: pip install -U yt-dlp"
    exit 1
}

Write-Host "Iniciando download do vídeo: $VideoUrl"
Write-Host "Formato: $FormatId"
Write-Host "Saída: $OutputPath"

# Executa o download com yt-dlp
$downloadArgs = @(
    $VideoUrl,
    "-f", $FormatId,
    "-o", "$OutputPath.%(ext)s",
    "--no-playlist",
    "--no-warnings",
    "--quiet"
)

& yt-dlp $downloadArgs

# Verifica se o download foi concluído com sucesso
if ($LASTEXITCODE -eq 0) {
    Write-Host "Download concluído com sucesso!"
    # Obtém o nome do arquivo que foi realmente baixado
    $directory = Split-Path -Path $OutputPath -Parent
    $baseName = Split-Path -Path $OutputPath -Leaf
    $file = Get-ChildItem -Path $directory -Filter "$baseName.*" | Select-Object -First 1
    
    if ($file) {
        Write-Host "Arquivo salvo em: $($file.FullName)"
        $file.FullName
        exit 0
    } else {
        Write-Host "Arquivo não encontrado após o download."
        exit 1
    }
} else {
    Write-Host "Erro ao realizar o download."
    exit $LASTEXITCODE
}
