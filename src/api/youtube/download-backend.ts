// Serviço para processar downloads do YouTube via backend
import axios from 'axios';

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
 * Faz o download de um vídeo do YouTube usando o backend com yt-dlp
 * 
 * @param options Opções de download
 * @returns Promise com o resultado do download
 */
export async function downloadVideo(options: DownloadOptions): Promise<DownloadResult> {
  const { videoUrl, formatId } = options;
  
  // Nome de arquivo padrão baseado no ID do vídeo e formato
  const videoId = extractVideoId(videoUrl);
  const outputFileName = options.outputFileName || `${videoId}_${formatId}`;
  const outputDir = options.outputDir || '/downloads';
  
  try {
    console.log(`Iniciando download do vídeo: ${videoUrl}`);
    console.log(`Formato selecionado: ${formatId}`);
    
    // Mapeia os formatos da interface para os formatos aceitos pelo yt-dlp
    const ytdlpFormat = mapFormatToYtDlp(formatId);
    
    // Chama a API do backend para iniciar o download usando yt-dlp
    const response = await axios.post('/api/youtube/download', {
      videoUrl,
      formatId: ytdlpFormat,
      outputPath: `${outputDir}/${outputFileName}`
    });
    
    if (response.data.success) {
      return {
        success: true,
        filePath: response.data.filePath,
        fileName: response.data.fileName
      };
    } else {
      throw new Error(response.data.error || 'Erro ao processar download');
    }
  } catch (error: any) {
    console.error('Erro no download:', error);
    
    // Verifica se o erro é da API ou de comunicação
    const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido no download';
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Mapeia os formatos da interface para os formatos do yt-dlp
 */
function mapFormatToYtDlp(formatId: string): string {
  switch (formatId) {
    case 'audio':
      return 'bestaudio[ext=m4a]/bestaudio/best';
    case 'video-sd':
      return 'best[height<=480]/best';
    case 'video-hd':
      return 'best[height<=720]/best';
    case 'video-fullhd':
      return 'best[height<=1080]/best';
    default:
      return 'best';
  }
}

/**
 * Extrai o ID do vídeo da URL do YouTube
 */
function extractVideoId(url: string): string {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : 'video';
}
