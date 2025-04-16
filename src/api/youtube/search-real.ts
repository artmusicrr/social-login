// Implementação de busca real no YouTube usando Playwright
import { chromium } from 'playwright';

interface SearchResult {
  id: string;
  title: string;
  channelName: string;
  thumbnail: string;
  duration: string;
  views: string;
  url: string;
}

/**
 * Realiza uma busca real no YouTube usando Playwright
 * 
 * @param query Termo de busca
 * @param maxResults Número máximo de resultados (padrão: 10)
 * @returns Promise com os resultados da busca
 */
export async function searchYouTube(query: string, maxResults = 10): Promise<SearchResult[]> {
  console.log(`Buscando por "${query}" (máx: ${maxResults} resultados)`);
  const results: SearchResult[] = [];
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navega para a página de resultados do YouTube
    const encodedQuery = encodeURIComponent(query);
    await page.goto(`https://www.youtube.com/results?search_query=${encodedQuery}`);
    
    // Aguarda os resultados da pesquisa carregarem
    await page.waitForSelector('ytd-video-renderer, ytd-grid-video-renderer');
    
    // Extrai informações dos resultados da pesquisa
    const videoElements = await page.$$('ytd-video-renderer, ytd-grid-video-renderer');
    
    for (let i = 0; i < Math.min(videoElements.length, maxResults); i++) {
      const videoElement = videoElements[i];
      
      try {
        // Extrai a URL e ID do vídeo
        const linkElement = await videoElement.$('a#thumbnail');
        const href = await linkElement?.getAttribute('href') || '';
        const videoId = href.includes('v=') ? href.split('v=')[1].split('&')[0] : '';
        
        if (!videoId) continue;
        
        // Extrai o título do vídeo
        const titleElement = await videoElement.$('h3 a#video-title, a#video-title');
        const title = await titleElement?.innerText() || 'Sem título';
        
        // Extrai o nome do canal
        const channelElement = await videoElement.$('ytd-channel-name a, #channel-name a');
        const channelName = await channelElement?.innerText() || 'Canal desconhecido';
        
        // Extrai a thumbnail
        const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        
        // Extrai a duração do vídeo
        const durationElement = await videoElement.$('span.ytd-thumbnail-overlay-time-status-renderer');
        const duration = await durationElement?.innerText() || '0:00';
        
        // Extrai o número de visualizações
        const metadataElement = await videoElement.$('div#metadata-line');
        const metadataText = await metadataElement?.innerText() || '';
        const views = metadataText.split('\n')[0] || '0 visualizações';
        
        results.push({
          id: videoId,
          title,
          channelName,
          thumbnail,
          duration,
          views,
          url: `https://www.youtube.com/watch?v=${videoId}`
        });
      } catch (error) {
        console.error('Erro ao extrair dados do vídeo:', error);
        continue;
      }
    }
    
    await browser.close();
    return results;
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    
    await browser.close();
    // Em caso de erro, retorna um array vazio
    return [];
  }
}
