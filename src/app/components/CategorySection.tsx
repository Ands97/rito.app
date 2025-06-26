'use client'
import { useState } from 'react'
import { Plus, Music, Trash2, Edit, ExternalLink, Youtube } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import SongSelector from './SongSelector'
import CreateSongModal from './CreateSongModal'

interface Props {
  category: {
    id: string
    name: string
    order_index: number
  }
  massId: string | any
  massSongs: Array<{
    id: string
    song_id: string
    order_index: number
    notes?: string
    song?: {
      id: string
      title: string
      artist?: string
      chords?: string
      lyrics?: string
      audio_url?: string
      youtube_url?: string
      cifraclub_url?: string
    }
  }>
  onUpdate: () => void
}

export default function CategorySection({ category, massId, massSongs, onUpdate }: Props) {
  const [showSongSelector, setShowSongSelector] = useState(false)
  const [showCreateSong, setShowCreateSong] = useState(false)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)

  const addSongToMass = async (songId: string) => {
    try {
      const maxOrder = massSongs.length > 0 
        ? Math.max(...massSongs.map(ms => ms.order_index))
        : 0

      const { error } = await supabase
        .from('mass_songs')
        .insert([{
          mass_id: massId,
          song_id: songId,
          category_id: category.id,
          order_index: maxOrder + 1
        }])

      if (error) throw error
      onUpdate()
      setShowSongSelector(false)
    } catch (error) {
      console.error('Error adding song to mass:', error)
    }
  }

  const removeSongFromMass = async (massSongId: string) => {
    try {
      const { error } = await supabase
        .from('mass_songs')
        .delete()
        .eq('id', massSongId)

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error removing song from mass:', error)
    }
  }

  const updateNotes = async (massSongId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('mass_songs')
        .update({ notes })
        .eq('id', massSongId)

      if (error) throw error
      onUpdate()
      setEditingNotes(null)
    } catch (error) {
      console.error('Error updating notes:', error)
    }
  }

  const reorderSongs = async (draggedId: string, targetIndex: number) => {
    try {
      const draggedSong = massSongs.find(ms => ms.id === draggedId)
      if (!draggedSong) return

      const reorderedSongs = [...massSongs]
      const draggedIndex = reorderedSongs.findIndex(ms => ms.id === draggedId)
      
      reorderedSongs.splice(draggedIndex, 1)
      reorderedSongs.splice(targetIndex, 0, draggedSong)

      // Atualizar order_index de todos
      const updates = reorderedSongs.map((ms, index) => ({
        id: ms.id,
        order_index: index + 1
      }))

      for (const update of updates) {
        await supabase
          .from('mass_songs')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }

      onUpdate()
    } catch (error) {
      console.error('Error reordering songs:', error)
    }
  }

  return (
    <div className="mb-8 bg-white rounded-lg shadow-md">
      <div className="bg-blue-50 px-6 py-4 rounded-t-lg">
        <h3 className="text-lg font-semibold text-blue-800">{category.name}</h3>
      </div>
      
      <div className="p-6">
        {massSongs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Music size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhuma música selecionada para {category.name}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {massSongs.map((massSong, index) => (
              <div
                key={massSong.id}
                className="border rounded-lg p-4 bg-gray-50"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', massSong.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const draggedId = e.dataTransfer.getData('text/plain')
                  reorderSongs(draggedId, index)
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{massSong.song?.title}</h4>
                    {massSong.song?.artist && (
                      <p className="text-gray-600">{massSong.song.artist}</p>
                    )}
                    
                    {/* Links externos */}
                    <div className="flex gap-2 mt-2">
                      {massSong.song?.youtube_url && (
                        <a
                          href={massSong.song.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                        >
                          <Youtube size={14} />
                          YouTube
                        </a>
                      )}
                      {massSong.song?.cifraclub_url && (
                        <a
                          href={massSong.song.cifraclub_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        >
                          <ExternalLink size={14} />
                          CifraClub
                        </a>
                      )}
                      {massSong.song?.audio_url && (
                        <a
                          href={massSong.song.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"
                        >
                          <Music size={14} />
                          Áudio
                        </a>
                      )}
                    </div>

                    {/* Notas */}
                    <div className="mt-3">
                      {editingNotes === massSong.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            defaultValue={massSong.notes || ''}
                            placeholder="Adicionar notas..."
                            className="flex-1 border rounded px-2 py-1 text-sm"
                            onBlur={(e) => updateNotes(massSong.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateNotes(massSong.id, e.currentTarget.value)
                              }
                              if (e.key === 'Escape') {
                                setEditingNotes(null)
                              }
                            }}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => setEditingNotes(massSong.id)}
                          className="text-sm text-gray-600 cursor-pointer hover:bg-gray-100 p-1 rounded"
                        >
                          {massSong.notes || 'Clique para adicionar notas...'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingNotes(massSong.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar notas"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => removeSongFromMass(massSong.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remover música"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowSongSelector(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={16} />
            Adicionar Música Existente
          </button>
          <button
            onClick={() => setShowCreateSong(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Plus size={16} />
            Criar Nova Música
          </button>
        </div>
      </div>

      {/* Modais */}
      {showSongSelector && (
        <SongSelector
          categoryId={category.id}
          onSelect={addSongToMass}
          onClose={() => setShowSongSelector(false)}
          excludeSongIds={massSongs.map(ms => ms.song_id)}
        />
      )}

      {showCreateSong && (
        <CreateSongModal
          categoryId={category.id}
          onSongCreated={(songId) => {
            addSongToMass(songId)
            setShowCreateSong(false)
          }}
          onClose={() => setShowCreateSong(false)}
        />
      )}
    </div>
  )
}