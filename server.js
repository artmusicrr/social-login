// Backend para processamento de downloads de vídeos YouTube usando yt-dlp
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4001; // Mudando para porta 4001

// Middleware para processar JSON
app.use(express.json());

// Pasta para downloads
const DOWNLOADS_DIR = path.join(__dirname, 'public', 'downloads');

// Garantir que a pasta de downloads existe
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Função para listar arquivos recentes na pasta de downloads
function getRecentFiles(directory, timeThresholdMs = 60000) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  
  const now = Date.now();
  const cutoffTime = now - timeThresholdMs;
  
  try {
    const files = fs.readdirSync(directory);
    
    return files
      .map(file => {
        const filePath = path.join(directory, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          time: stats.mtime.getTime(),
          isRecent: stats.mtime.getTime() > cutoffTime
        };
      })
      .filter(file => file.isRecent)
      .sort((a, b) => b.time - a.time); // Ordenar por mais recente primeiro
  } catch (err) {
    console.error(`Erro ao ler diretório ${directory}:`, err);
    return [];
  }
}

// Endpoint para processar downloads
app.post('/api/youtube/download', (req, res) => {
  const { videoUrl, formatId, outputPath } = req.body;
  
  if (!videoUrl || !formatId) {
    return res.status(400).json({
      success: false,
      error: 'URL do vídeo e formato são obrigatórios'
    });
  }
  
  // Formata o caminho de saída para ser salvo na pasta de downloads
  const baseOutputPath = path.join(DOWNLOADS_DIR, path.basename(outputPath || 'video'));
  console.log(`Iniciando download: ${videoUrl}`);
  console.log(`Formato: ${formatId}`);
  console.log(`Caminho de saída: ${baseOutputPath}`);
  
  // Simplifica a seleção de formato para evitar problemas de mesclagem
  let ytdlpFormat;
  switch (formatId) {
    case 'best':
    case 'video-fullhd':
      ytdlpFormat = 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best';
      break;
    case 'video-hd':
      ytdlpFormat = 'best[height<=720][ext=mp4]/bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best';
      break;
    case 'video-sd':
      ytdlpFormat = 'best[height<=480][ext=mp4]/bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best';
      break;
    case 'audio':
      ytdlpFormat = 'bestaudio[ext=m4a]/bestaudio';
      break;
    default:
      ytdlpFormat = 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best';
  }
  
  // Detecta ambiente
  const isWindows = process.platform === 'win32';
  const isWSL = process.platform === 'linux' && process.env.WSL_DISTRO_NAME;
  
  // Define um nome de arquivo personalizado para o download com timestamp para evitar sobrescrever arquivos
  const customFileName = `downloaded_video_${Date.now()}`;
  
  // Caminho de saída do arquivo
  let outputTemplate;
  let command;  if (isWSL) {
    // No WSL, vamos usar o script bash dedicado para download
    // Este script lida melhor com a integração entre WSL e Windows
    const scriptPath = path.join(__dirname, 'scripts', 'download-youtube.sh');
    outputTemplate = `downloaded_video_${Date.now()}`;
    command = `bash ${scriptPath} "${videoUrl}" "${ytdlpFormat}" "${outputTemplate}"`;
  } else if (isWindows) {
    // No Windows, usa caminho absoluto com barras invertidas escapadas
    outputTemplate = `${DOWNLOADS_DIR.replace(/\\/g, '\\\\')}\\${customFileName}.mp4`;
    command = `yt-dlp "${videoUrl}" -f "${ytdlpFormat}" -o "${outputTemplate}" --merge-output-format mp4 --no-playlist --restrict-filenames --print filename`;
  } else {
    // No Linux nativo
    outputTemplate = `${DOWNLOADS_DIR.replace(/\\/g, '/')}/${customFileName}.mp4`;
    command = `python3 -m yt_dlp "${videoUrl}" -f "${ytdlpFormat}" -o "${outputTemplate}" --merge-output-format mp4 --no-playlist --restrict-filenames --print filename`;
  }
  
  console.log(`Sistema operacional: ${process.platform}`);
  console.log(`Ambiente WSL: ${isWSL ? 'Sim' : 'Não'}`);
  console.log(`Executando comando: ${command}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro na execução: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: `Erro ao executar o script: ${error.message}`
      });
    }
    
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    
    console.log(`Resultado: ${stdout}`);
    
    // Verifica se o arquivo foi gerado
    try {
      // Tenta extrair o nome do arquivo da saída do yt-dlp
      const outputLines = stdout.trim().split('\n');
      const lastLine = outputLines[outputLines.length - 1];
      
      console.log(`Arquivo indicado pelo yt-dlp: ${lastLine}`);
        // O nome do arquivo que esperamos (independente do caminho)
      const expectedFileName = `${customFileName}.mp4`;
      
      // Conjunto de caminhos para verificar, em ordem de prioridade
      const pathsToCheck = [
        lastLine, // Caminho exato reportado pelo yt-dlp
        path.join(DOWNLOADS_DIR, path.basename(lastLine)), // Apenas o nome do arquivo na pasta de downloads
        path.join(DOWNLOADS_DIR, expectedFileName), // O nome customizado na pasta de downloads
        path.join(__dirname, 'public', 'downloads', expectedFileName), // Caminho relativo ao projeto
        path.join(__dirname, 'public', 'downloads', path.basename(lastLine)), // Nome do arquivo na pasta do projeto
        `./public/downloads/${expectedFileName}`, // Caminho relativo simples
        expectedFileName, // Apenas o nome do arquivo
        `./${expectedFileName}` // Nome do arquivo na pasta atual
      ];
      
      console.log(`Verificando possíveis locais do arquivo:`);
      for (const filePath of pathsToCheck) {
        if (!filePath) continue;
        console.log(`- Verificando: ${filePath}`);
        if (fs.existsSync(filePath)) {
          console.log(`✓ Arquivo encontrado: ${filePath}`);
          // Extrai apenas o nome do arquivo do caminho completo
          const fileName = path.basename(filePath);
          // Caminho relativo para o frontend
          const frontendPath = `/downloads/${fileName}`;
          
          return res.json({
            success: true,
            fileName: fileName,
            filePath: frontendPath
          });
        }
      }
      
      // Se nenhum dos caminhos específicos funcionou, procura por arquivos recentes
      console.log(`Buscando arquivos recentes na pasta de downloads...`);
      const recentFiles = getRecentFiles(DOWNLOADS_DIR, 60000); // Arquivos dos últimos 60 segundos
      
      if (recentFiles.length > 0) {
        console.log(`Encontrados arquivos recentes: ${recentFiles.map(f => f.name).join(', ')}`);
        const fileName = recentFiles[0].name;
        const filePath = `/downloads/${fileName}`;
        
        return res.json({
          success: true,
          fileName: fileName,
          filePath: filePath
        });
      }
      
      // Último recurso: verifica se há algum arquivo na pasta de downloads
      console.log(`Buscando qualquer arquivo na pasta de downloads...`);
      const files = fs.readdirSync(DOWNLOADS_DIR);
      
      if (files.length > 0) {
        // Pega o arquivo mais recentemente modificado na pasta de downloads
        const mostRecentFile = files
          .map(file => ({
            name: file,
            time: fs.statSync(path.join(DOWNLOADS_DIR, file)).mtime.getTime()
          }))
          .sort((a, b) => b.time - a.time)[0];
        
        if (mostRecentFile) {
          console.log(`Arquivo mais recente encontrado: ${mostRecentFile.name}`);
          const fileName = mostRecentFile.name;
          const filePath = `/downloads/${fileName}`;
          
          return res.json({
            success: true,
            fileName: fileName,
            filePath: filePath
          });
        }
      }
      
      // Se chegou aqui, realmente não encontrou nenhum arquivo
      console.log(`Pasta de downloads vazia ou nenhum arquivo encontrado.`);
      return res.status(404).json({
        success: false,
        error: 'Nenhum arquivo encontrado na pasta de downloads'
      });
    } catch (err) {
      console.error('Erro ao verificar arquivo:', err);
      return res.status(500).json({
        success: false,
        error: `Erro ao verificar o arquivo: ${err.message}`
      });
    }
  });
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
