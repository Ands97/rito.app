'use client'

import { useState, useEffect } from 'react'
import { X, Search, Music } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Loading } from './Loading'

interface Props {
  categoryId: string
  onSelect: (songId: string) => void
  onClose: () => void
  excludeSongIds: string[]
}

export default function SongSelector({ categoryId, onSelect, onClose, excludeSongIds }: Props) {
  const [songs, setSongs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSongs()
  }, [categoryId, searchTerm])

  const fetchSongs = async () => {
    try {
      let query = supabase
        .from('songs')
        .select('*')
        .not('id', 'in', `(${excludeSongIds.join(',')})`)

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,artist.ilike.%${searchTerm}%`)
      }

      // Filtrar por categoria se especificada
      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query.order('title')

      if (error) throw error
      setSongs(data || [])
    } catch (error) {
      console.error('Error fetching songs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Selecionar Música</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 border-b">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título ou artista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <Loading />
          ) : songs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Music size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma música encontrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => onSelect(song.id)}
                  className="border rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <h4 className="font-medium">{song.title}</h4>
                  {song.artist && (
                    <p className="text-gray-600 text-sm">{song.artist}</p>
                  )}
                  <div className="flex gap-2 mt-2 text-xs text-gray-500">
                    {song.chords && <span>• Cifras</span>}
                    {song.lyrics && <span>• Letra</span>}
                    {song.audio_url && <span>• Áudio</span>}
                    {song.youtube_url && <span>• YouTube</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}