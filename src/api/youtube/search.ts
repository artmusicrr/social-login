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
    // Configuração com user-agent realista para evitar detecção como bot
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();

    // Navega para a página de resultados do YouTube
    const encodedQuery = encodeURIComponent(query);
    await page.goto(`https://www.youtube.com/results?search_query=${encodedQuery}`);
    
    console.log(`Aguardando carregamento de resultados para "${query}"...`);
    
    // Aguarda os resultados da pesquisa carregarem com timeout maior
    await page.waitForSelector('ytd-video-renderer', { timeout: 30000 });    // Rola a página gradualmente para carregar mais resultados
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      // Espera um pouco mais entre cada rolagem para simular comportamento humano
      await page.waitForTimeout(1500);
    }
    
    // Captura screenshot para debug (opcional, remova em produção)
    await page.screenshot({ path: 'youtube_search_results.png' });    // Extrai informações dos resultados da pesquisa
    const videoElements = await page.$$('ytd-video-renderer');
    console.log(`Encontrados ${videoElements.length} elementos de vídeo na página`);

    if (videoElements.length === 0) {
      // Se não encontrarmos elementos, tente seletores alternativos
      console.log('Tentando seletores alternativos...');
      const altVideoElements = await page.$$('ytd-video-renderer, ytd-grid-video-renderer');
      if (altVideoElements.length > 0) {
        console.log(`Encontrados ${altVideoElements.length} elementos com seletores alternativos`);
        videoElements.push(...altVideoElements);
      }
    }

    for (let i = 0; i < Math.min(videoElements.length, maxResults); i++) {
      const videoElement = videoElements[i];

      try {
        // Extrai a URL e ID do vídeo
        const linkElement = await videoElement.$('a#thumbnail');
        const href = await linkElement?.getAttribute('href') || '';
        console.log(`[Debug] URL do vídeo ${i+1}: ${href}`);
        
        const videoIdMatch = href.match(/v=([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : '';

        if (!videoId) {
          console.warn(`Vídeo ${i+1} sem ID encontrado, pulando...`);
          continue;
        }

        // Extrai o título do vídeo
        const titleElement = await videoElement.$('h3 a#video-title');
        const title = (await titleElement?.innerText())?.trim() || 'Sem título';

        // Extrai o nome do canal
        const channelElement = await videoElement.$('ytd-channel-name a');
        const channelName = (await channelElement?.innerText())?.trim() || 'Canal desconhecido';

        // Extrai a thumbnail
        const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

        // Extrai a duração do vídeo
        const durationElement = await videoElement.$('span.ytd-thumbnail-overlay-time-status-renderer');
        const duration = (await durationElement?.innerText())?.trim() || '0:00';

        // Extrai o número de visualizações
        const metadataElement = await videoElement.$('div#metadata-line span');
        const views = (await metadataElement?.innerText())?.trim() || '0 visualizações';

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
        console.error(`Erro ao extrair vídeo ${i + 1}:`, error);
        continue;
      }
    }

    console.log('Resultados brutos extraídos:', results);

    // Categorias para melhorar relevância da busca
    const categories: { [key: string]: string[] } = {
      música: ['rick astley', 'gangnam style', 'onerepublic', 'counting stars', 'music', 'música', 'song', 'canção'],
      tutorial: ['react', 'javascript', 'html', 'css', 'web', 'programming', 'tutorial', 'curso', 'aula'],
      jogos: ['minecraft', 'game', 'jogo', 'gameplay'],
      comédia: ['key & peele', 'comedy', 'comédia', 'humor', 'funny', 'engraçado'],
      esportes: ['messi', 'football', 'soccer', 'esporte', 'futebol'],
      ciência: ['universe', 'universo', 'black hole', 'science', 'ciência'],
      tecnologia: ['iphone', 'apple', 'tech', 'review', 'análise', 'tecnologia']
    };    // Função para determinar relevância do vídeo para a consulta com melhor tratamento de variações
    const getRelevanceScore = (video: SearchResult, searchQuery: string): number => {
      const lcQuery = searchQuery.toLowerCase();
      const lcTitle = video.title.toLowerCase();
      const lcChannel = video.channelName.toLowerCase();

      let score = 0;

      // Correspondência exata (mais alta pontuação)
      if (lcTitle.includes(lcQuery)) {
        score += 100;
      }

      if (lcChannel.includes(lcQuery)) {
        score += 50;
      }

      // Processa palavras individuais da consulta
      const queryWords = lcQuery.split(' ');
      queryWords.forEach(word => {
        if (word.length > 2 && lcTitle.includes(word)) {
          score += 20;
        }
      });

      // Trata variações comuns de ortografia (especialmente para "bee gess" -> "bee gees")
      const commonMisspellings: {[key: string]: string[]} = {
        'gess': ['gees', 'gee', 'geez'],
        'bee': ['bee', 'bees'],
        'astley': ['ashley', 'astly'],
        'gangnam': ['gangam', 'gangam']
      };
      
      // Verifica se as palavras da busca têm variações conhecidas no título
      queryWords.forEach(word => {
        const variations = commonMisspellings[word] || [];
        if (variations.some(variation => lcTitle.includes(variation) || lcChannel.includes(variation))) {
          score += 40; // Pontuação alta para variações conhecidas
          console.log(`Correspondência de variação encontrada: "${word}" -> "${variations.filter(v => lcTitle.includes(v) || lcChannel.includes(v))}"`);
        }
      });

      // Verifica correspondência por categoria
      Object.entries(categories).forEach(([category, keywords]) => {
        if (keywords.some(keyword => lcQuery.includes(keyword))) {
          if (keywords.some(keyword => lcTitle.includes(keyword) || lcChannel.includes(keyword))) {
            score += 30;
          }
        }
      });

      console.log(`Score para "${video.title}": ${score}`);
      return score;
    };    // Aplica o algoritmo de relevância para classificar resultados
    console.log(`Aplicando algoritmo de relevância para ${results.length} resultados...`);
    
    // Mapeia vídeos com seus scores de relevância
    const scoredVideos = [...results].map(video => ({
      video,
      score: getRelevanceScore(video, query)
    }));
    
    // Ordena por score (maior para menor)
    const sortedVideos = scoredVideos.sort((a, b) => b.score - a.score);
    
    // Extrai apenas os objetos de vídeo
    const filteredAndSortedVideos = sortedVideos.map(item => item.video).slice(0, maxResults);
    
    console.log('Resultados após ordenação:', filteredAndSortedVideos.map(v => `${v.title} (Score: ${
      scoredVideos.find(sv => sv.video.id === v.id)?.score || 0
    })`));

    // Mesmo com score zero, retornamos os resultados encontrados se tivermos algum
    // Para evitar fallback para resultados mockados
    if (filteredAndSortedVideos.length === 0 && results.length > 0) {
      console.warn(`Nenhum resultado com score relevante para "${query}", mas retornando resultados encontrados.`);
      return results.slice(0, maxResults);
    } else if (filteredAndSortedVideos.length === 0) {
      console.warn(`Nenhum resultado encontrado para "${query}". Verificando se é necessário usar dados mockados.`);
    }

    // Simula um tempo de resposta da API
    await new Promise(resolve => setTimeout(resolve, 500));

    return filteredAndSortedVideos;
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    return results.length > 0 ? results.slice(0, maxResults) : [];
  } finally {
    await browser.close();
  }
}