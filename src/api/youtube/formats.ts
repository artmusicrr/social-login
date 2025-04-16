/**
 * Lista de formatos disponíveis para download do YouTube
 */

export interface VideoFormat {
  id: string;
  label: string;
  quality: string;
  hasAudio: boolean;
  hasVideo: boolean;
  container: string;
}

export const videoFormats: VideoFormat[] = [
  {
    id: 'bestvideo+bestaudio/best',
    label: 'Melhor Qualidade (vídeo + áudio)',
    quality: 'Máxima',
    hasAudio: true,
    hasVideo: true,
    container: 'mp4'
  },
  {
    id: '137+140',
    label: '1080p (mp4)',
    quality: 'Alta',
    hasAudio: true,
    hasVideo: true,
    container: 'mp4'
  },
  {
    id: '136+140',
    label: '720p (mp4)',
    quality: 'Média',
    hasAudio: true,
    hasVideo: true,
    container: 'mp4'
  },
  {
    id: '135+140',
    label: '480p (mp4)',
    quality: 'Baixa',
    hasAudio: true,
    hasVideo: true,
    container: 'mp4'
  },
  {
    id: '140',
    label: 'Somente áudio (m4a)',
    quality: '-',
    hasAudio: true,
    hasVideo: false,
    container: 'm4a'
  }
];

/**
 * Retorna todos os formatos de vídeo disponíveis
 */
export function getAvailableFormats(): VideoFormat[] {
  return videoFormats;
}

/**
 * Busca um formato pelo ID
 */
export function getFormatById(formatId: string): VideoFormat | undefined {
  return videoFormats.find(format => format.id === formatId);
}
