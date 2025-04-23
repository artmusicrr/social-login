import { exec } from 'child_process';
import path from 'path';

const YT_DLP_PATH = 'C:\\Windows\\System32\\yt-dlp.exe'; // Ajuste este caminho para onde você colocou o yt-dlp.exe

export const downloadVideo = (videoUrl) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(process.cwd(), 'public', 'downloads', '%(title)s.%(ext)s');
    
    const command = `"${YT_DLP_PATH}" "${videoUrl}" -f "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" -o "${outputPath}" --merge-output-format mp4 --no-playlist --restrict-filenames --print filename`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Erro na execução:', error);
        reject(error);
        return;
      }
      if (stderr) {
        console.error('Erro:', stderr);
      }
      resolve(stdout.trim());
    });
  });
}; 