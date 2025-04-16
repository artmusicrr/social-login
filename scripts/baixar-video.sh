#!/bin/bash

# Script para download de vídeos do YouTube usando yt-dlp
# Uso: ./baixar-video.sh [URL] [FORMATO] [CAMINHO_SAIDA]

# Verifica se todos os parâmetros foram fornecidos
if [ $# -lt 3 ]; then
  echo "Erro: Parâmetros insuficientes"
  echo "Uso: $0 [URL] [FORMATO] [CAMINHO_SAIDA]"
  exit 1
fi

VIDEO_URL="$1"
FORMAT_ID="$2"
OUTPUT_PATH="$3"

# Verifica se o yt-dlp está instalado
if ! command -v yt-dlp &> /dev/null; then
  echo "Erro: yt-dlp não está instalado. Instale com: pip install -U yt-dlp"
  exit 1
fi

echo "Iniciando download do vídeo: $VIDEO_URL"
echo "Formato: $FORMAT_ID"
echo "Saída: $OUTPUT_PATH"

# Executa o download com yt-dlp
yt-dlp "$VIDEO_URL" \
  -f "$FORMAT_ID" \
  -o "${OUTPUT_PATH}.%(ext)s" \
  --no-playlist \
  --no-warnings \
  --quiet

# Verifica se o download foi concluído com sucesso
if [ $? -eq 0 ]; then
  echo "Download concluído com sucesso!"
  # Obtém o nome do arquivo que foi realmente baixado
  FILE_PATH=$(find "$(dirname "$OUTPUT_PATH")" -name "$(basename "$OUTPUT_PATH").*" -type f | head -n 1)
  echo "Arquivo salvo em: $FILE_PATH"
  exit 0
else
  echo "Erro ao realizar o download."
  exit 1
fi
