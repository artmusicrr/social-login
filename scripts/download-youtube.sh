#!/bin/bash

# Script para download de vídeos do YouTube diretamente para a pasta de downloads
# Uso: ./download-youtube.sh [URL] [FORMAT] [OUTPUT_NAME]

# Verifica se todos os parâmetros foram fornecidos
if [ $# -lt 3 ]; then
  echo "Uso: $0 [URL] [FORMAT] [OUTPUT_NAME]"
  exit 1
fi

VIDEO_URL="$1"
FORMAT="$2"
OUTPUT_NAME="$3"

# Caminho para a pasta de downloads
DOWNLOAD_DIR="./public/downloads"

# Garante que a pasta de downloads existe
mkdir -p "$DOWNLOAD_DIR"

# Define o caminho completo do arquivo de saída
OUTPUT_PATH="$DOWNLOAD_DIR/$OUTPUT_NAME"

echo "Iniciando download do vídeo: $VIDEO_URL"
echo "Formato: $FORMAT"
echo "Salvando em: $OUTPUT_PATH"

# Executa o download com yt-dlp
python3 -m yt_dlp "$VIDEO_URL" \
  -f "$FORMAT" \
  -o "$OUTPUT_PATH.%(ext)s" \
  --merge-output-format mp4 \
  --no-playlist \
  --restrict-filenames

# Verifica se o download foi bem-sucedido
if [ $? -eq 0 ]; then
  # Lista os arquivos na pasta de downloads
  echo "Arquivos na pasta de downloads:"
  ls -la "$DOWNLOAD_DIR"
  
  # Verifica se o arquivo existe
  if [ -f "$OUTPUT_PATH.mp4" ]; then
    echo "Download concluído com sucesso: $OUTPUT_PATH.mp4"
    # Retorna o caminho relativo do arquivo
    echo "$DOWNLOAD_DIR/$(basename $OUTPUT_PATH.mp4)"
    exit 0
  else
    echo "Erro: Arquivo não encontrado após o download."
    # Lista todos os arquivos para debug
    find "$DOWNLOAD_DIR" -type f -name "*.mp4" | sort -r
    exit 1
  fi
else
  echo "Erro ao realizar o download."
  exit 1
fi
