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
    // Caminho para o script PowerShell
  const scriptPath = path.join(__dirname, 'scripts', 'baixar-video.ps1');
  
  // Comando para executar o script PowerShell no Windows
  const command = `powershell -ExecutionPolicy Bypass -File "${scriptPath}" "${videoUrl}" "${formatId}" "${baseOutputPath}"`;
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
      // Busca arquivos que correspondam ao padrão (para lidar com extensões desconhecidas)
      const dirName = path.dirname(baseOutputPath);
      const baseName = path.basename(baseOutputPath);
      
      const files = fs.readdirSync(dirName).filter(file => 
        file.startsWith(baseName) || file.startsWith(path.parse(baseName).name)
      );
      
      if (files.length > 0) {
        const fileName = files[0];
        // Caminho relativo para o frontend
        const filePath = `/downloads/${fileName}`;
        
        return res.json({
          success: true,
          fileName: fileName,
          filePath: filePath
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'Arquivo não encontrado após o download'
        });
      }
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
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
