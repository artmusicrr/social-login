// Função para excluir arquivos do servidor após o download
import axios from 'axios';

/**
 * Exclui um arquivo de vídeo do servidor após o download
 * 
 * @param fileName Nome do arquivo a ser excluído
 * @returns Promise indicando sucesso ou falha na exclusão
 */
export async function deleteDownloadedFile(fileName: string): Promise<{success: boolean; error?: string}> {
  try {
    if (!fileName) {
      return { success: false, error: 'Nome de arquivo não fornecido' };
    }
    
    console.log(`Solicitando exclusão do arquivo: ${fileName}`);
    
    const response = await axios.delete(`/api/youtube/download/${encodeURIComponent(fileName)}`);
    
    if (response.data.success) {
      console.log(`Arquivo excluído com sucesso: ${fileName}`);
      return { success: true };
    } else {
      console.warn(`Falha ao excluir arquivo: ${response.data.error}`);
      return { success: false, error: response.data.error };
    }
  } catch (error: any) {
    console.error('Erro ao excluir arquivo:', error);
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Erro ao excluir o arquivo'
    };
  }
}
