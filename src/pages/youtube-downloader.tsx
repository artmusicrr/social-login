import React, { useState, useEffect } from 'react';
import { searchYouTube } from '../api/youtube/search-api';
import { getAvailableFormats } from '../api/youtube/formats';
import { downloadVideo } from '../api/youtube/download-yt-dlp';
import { deleteDownloadedFile } from '../api/youtube/file-manager';

const YouTubeDownloader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [downloadFileName, setDownloadFileName] = useState('');
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 9; // 3x3 grid
  
  const formats = getAvailableFormats();
  
  // Atualiza os resultados visíveis quando a página muda
  useEffect(() => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    setSearchResults(allResults.slice(startIndex, endIndex));
  }, [currentPage, allResults]);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setMessage('Buscando...');
    setCurrentPage(1); // Volta para a primeira página em uma nova busca
    
    try {
      const results = await searchYouTube(searchQuery, 30); // Aumenta para mais resultados
      setAllResults(results);
      setSearchResults(results.slice(0, resultsPerPage));
      setMessage(results.length > 0 ? '' : 'Nenhum resultado encontrado');
    } catch (error) {
      console.error('Erro na busca:', error);
      setMessage('Erro ao buscar vídeos');
      setAllResults([]);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectVideo = (video: any) => {
    setSelectedVideo(video);
    setSelectedFormat('');
    setDownloadLink('');
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const totalPages = Math.ceil(allResults.length / resultsPerPage);
    const handleDownload = async () => {
    if (!selectedVideo || !selectedFormat) return;
    
    setLoading(true);
    setMessage('Preparando download...');
    
    try {
      const downloadResult = await downloadVideo({
        videoUrl: selectedVideo.url,
        formatId: selectedFormat,
        outputFileName: `${selectedVideo.id}_${selectedFormat}`
      });
        
      if (downloadResult.success && downloadResult.filePath) {
        setDownloadLink(downloadResult.filePath);
        setDownloadFileName(downloadResult.fileName || '');
        setMessage('Download concluído com sucesso! Clique no link abaixo para baixar.');
      } else {
        setMessage(`Falha no download: ${downloadResult.error || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      console.error('Erro no download:', error);
      setMessage(`Erro no download: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Componente de paginação
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center my-4 gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50"
        >
          &laquo;
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50"
        >
          &raquo;
        </button>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-200">YouTube Downloader</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Baixar Vídeos do YouTube</h2>
          
          {/* Formulário de Busca */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do vídeo ou canal"
                className="flex-1 px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                Buscar
              </button>
            </div>
          </form>
          
          {/* Área de Resultados */}
          {searchResults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Resultados da Busca {allResults.length > 0 && `(${allResults.length} vídeos)`}
              </h3>
              
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {searchResults.map((video) => (
                  <div 
                    key={video.id} 
                    className={`border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${selectedVideo?.id === video.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => handleSelectVideo(video)}
                  >
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-28 object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                        {video.duration}
                      </span>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-700">
                      <h4 className="font-medium text-xs line-clamp-2">{video.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{video.channelName}</p>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{video.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Paginação */}
              <Pagination />
            </div>
          )}
          
          {/* Área de Download */}
          {selectedVideo && (
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Download do Vídeo</h3>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="md:w-1/3">
                  <img 
                    src={selectedVideo.thumbnail} 
                    alt={selectedVideo.title} 
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="md:w-2/3">
                  <h4 className="font-semibold mb-2">{selectedVideo.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{selectedVideo.channelName}</p>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Formato:</label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                    >
                      <option value="">Selecione um formato</option>
                      {formats.map((format) => (
                        <option key={format.id} value={format.id}>
                          {format.label} - {format.quality}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleDownload}
                    disabled={!selectedFormat || loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none disabled:opacity-50 w-full"
                  >
                    {loading ? 'Processando...' : 'Baixar Vídeo'}
                  </button>
                </div>
              </div>
              
              {message && (
                <div className={`p-3 rounded-md ${downloadLink ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}`}>
                  {message}
                </div>
              )}
                {downloadLink && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-600 rounded-md">
                  <p className="mb-2 font-medium">Download pronto!</p>
                  <a 
                    href={downloadLink}
                    download={downloadFileName}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={() => {
                      // Agenda a exclusão do arquivo após um pequeno atraso para garantir que o download inicie
                      setTimeout(() => {
                        deleteDownloadedFile(downloadFileName)
                          .then(result => {
                            if (result.success) {
                              console.log(`Arquivo ${downloadFileName} excluído com sucesso após o download`);
                            } else {
                              console.warn(`Não foi possível excluir o arquivo: ${result.error}`);
                            }
                          });
                      }, 1000);
                    }}
                  >
                    Clique aqui para baixar o arquivo
                  </a>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    O arquivo será removido do servidor automaticamente após o download.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default YouTubeDownloader;
