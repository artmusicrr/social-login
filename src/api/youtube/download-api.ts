// Implementação de download real de vídeos do YouTube usando APIs públicas
import { getFormatById } from './formats';

interface DownloadOptions {
  videoUrl: string;
  formatId: string;
  outputFileName?: string;
  outputDir?: string;
}

interface DownloadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

/**
 * Faz o download real de um vídeo do YouTube usando APIs públicas
 * 
 * @param options Opções de download
 * @returns Promise com o resultado do download
 */
export async function downloadVideo(options: DownloadOptions): Promise<DownloadResult> {
  const { videoUrl, formatId } = options;
  
  // Verifica se o formato solicitado existe
  const format = getFormatById(formatId);
  if (!format) {
    return {
      success: false,
      error: `Formato inválido: ${formatId}`
    };
  }
  
  console.log(`Iniciando download do vídeo: ${videoUrl}`);
  console.log(`Formato selecionado: ${format.label} (${format.quality})`);
  
  try {
    // Extrai o ID do vídeo da URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return {
        success: false,
        error: 'URL de vídeo inválida'
      };
    }
    
    // Escolhe o método de download com base no formato selecionado
    if (format.id === 'audio') {
      return await downloadAudio(videoId, options);
    } else {
      return await downloadVideoWithFormat(videoId, format, options);
    }
  } catch (error: any) {
    console.error('Erro no download:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido durante o download'
    };
  }
}

/**
 * Download de áudio usando API pública
 */
async function downloadAudio(videoId: string, options: DownloadOptions): Promise<DownloadResult> {
  try {
    // Usamos a API do yt-download.org para obter o link de download de áudio
    const fileName = `${videoId}_audio.mp3`;
    
    // Esta URL redirecionará para o download real (MP3)
    const downloadUrl = `https://www.yt-download.org/api/button/mp3/${videoId}`;
    
    // Inicia o download automaticamente
    window.open(downloadUrl, '_blank');
    
    return {
      success: true,
      fileName: fileName,
      filePath: downloadUrl
    };
  } catch (error: any) {
    console.error('Erro ao baixar áudio:', error);
    return {
      success: false,
      error: `Falha ao baixar o áudio: ${error.message}`
    };
  }
}

/**
 * Download de vídeo usando API pública
 */
async function downloadVideoWithFormat(videoId: string, format: any, options: DownloadOptions): Promise<DownloadResult> {
  try {
    let downloadUrl: string;
    let fileName: string;
    
    // Escolhe a qualidade com base no formato selecionado
    if (format.id === 'video-hd') {
      // HD - 720p
      fileName = `${videoId}_hd.mp4`;
      downloadUrl = `https://www.yt-download.org/api/button/videos/${videoId}/mp4/720`;
    } else if (format.id === 'video-fullhd') {
      // Full HD - 1080p
      fileName = `${videoId}_fullhd.mp4`;
      downloadUrl = `https://www.yt-download.org/api/button/videos/${videoId}/mp4/1080`;
    } else {
      // SD - 360p (padrão)
      fileName = `${videoId}_sd.mp4`;
      downloadUrl = `https://www.yt-download.org/api/button/videos/${videoId}/mp4/360`;
    }
    
    // Abre a URL de download em uma nova aba
    window.open(downloadUrl, '_blank');
    
    return {
      success: true,
      fileName: fileName,
      filePath: downloadUrl
    };
  } catch (error: any) {
    console.error('Erro ao baixar vídeo:', error);
    return {
      success: false,
      error: `Falha ao baixar o vídeo: ${error.message}`
    };
  }
}

/**
 * Extrai o ID do vídeo da URL do YouTube
 */
function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}
