export const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.error('YouTube API Key não encontrada. Verifique se a variável de ambiente REACT_APP_YOUTUBE_API_KEY está configurada.');
} 