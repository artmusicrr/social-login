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
# Se o nome contém o padrão "downloaded_video_", usamos o título original do vídeo
if [[ "$OUTPUT_NAME" == *"downloaded_video_"* ]]; then
  # Usa o título original do vídeo, sanitizando caracteres problemáticos
  OUTPUT_PATH="$DOWNLOAD_DIR/%(title)s"
  USE_ORIGINAL_TITLE=true
else
  # Usa o nome fornecido
  OUTPUT_PATH="$DOWNLOAD_DIR/$OUTPUT_NAME"
  USE_ORIGINAL_TITLE=false
fi

echo "Iniciando download do vídeo: $VIDEO_URL"
echo "Formato: $FORMAT"
echo "Usando título original: $USE_ORIGINAL_TITLE"
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
  
  # Encontra o arquivo mais recente na pasta de downloads (que deve ser o que acabamos de baixar)
  DOWNLOADED_FILE=$(find "$DOWNLOAD_DIR" -type f -name "*.mp4" -printf '%T@ %p\n' | sort -nr | head -n1 | cut -d' ' -f2-)
  
  if [ -n "$DOWNLOADED_FILE" ]; then
    echo "Download concluído com sucesso: $DOWNLOADED_FILE"
    # Retorna o caminho relativo do arquivo
    echo "$DOWNLOADED_FILE"
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
