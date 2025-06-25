'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Music, Volume2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Loading } from '@/app/components/Loading'
import { Header } from '@/app/components/Header'

export default function PresentMassPage() {
  const params = useParams()
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [massSongs, setMassSongs] = useState<any[]>([])
  const [showChords, setShowChords] = useState(true)

  useEffect(() => {
    fetchMassSongs()
  }, [params.id])

  const fetchMassSongs = async () => {
    const { data } = await supabase
      .from('mass_songs')
      .select(`
        *,
        song:songs(*),
        category:categories(*)
      `)
      .eq('mass_id', params.id)
      .order('order_index')
    setMassSongs(data || [])
  }

  const currentSong = massSongs[currentSongIndex]

  const nextSong = () => {
    if (currentSongIndex < massSongs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1)
    }
  }

  const prevSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1)
    }
  }

  if (!currentSong) return <Loading />

  const getEmbedUrl = (url: string) => {
    // Isso cobre youtube.com/watch?v=ID e youtu.be/ID
    const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=0&controls=1&modestbranding=1&rel=0`;
    }
    return null;
  };

  const youtubeEmbedUrl = currentSong.song?.youtube_url ? getEmbedUrl(currentSong.song.youtube_url) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6">
      <Header />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-sm text-gray-400">{currentSong.category?.name}</h2>
            <h1 className="text-2xl font-bold">{currentSong.song?.title}</h1>
            {currentSong.song?.artist && (
              <p className="text-gray-300">{currentSong.song.artist}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {/* Botão de Áudio Existente */}
            {currentSong.song?.audio_url && (
              <button className="bg-green-600 px-3 py-1 rounded flex items-center gap-2">
                <Volume2 size={16} />
                Áudio
              </button>
            )}

            {/* Miniplayer do YouTube */}
            {youtubeEmbedUrl && (
              <div className="w-48 h-28"> {/* Ajuste largura (w-48) e altura (h-28) conforme necessário */}
                <iframe
                  src={youtubeEmbedUrl}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-md"
                ></iframe>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo da música */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 min-h-96">
          {showChords && currentSong.song?.chords ? (
            <pre className="whitespace-pre-wrap text-lg leading-relaxed">
              {currentSong.song.chords}
            </pre>
          ) : (
            <div className="text-lg leading-relaxed">
              {currentSong.song?.lyrics?.split('\n').map((line: any, i: number) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          )}
        </div>

        {/* Navegação */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevSong}
            disabled={currentSongIndex === 0}
            className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded disabled:opacity-50"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              {currentSongIndex + 1} de {massSongs.length}
            </p>
          </div>

          <button
            onClick={nextSong}
            disabled={currentSongIndex === massSongs.length - 1}
            className="flex items-center gap-2 bg-gray-700 px-4 py-2 rounded disabled:opacity-50"
          >
            Próxima
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}