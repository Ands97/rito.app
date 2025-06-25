'use client'

import { useState } from 'react'
import { X, Youtube, ExternalLink, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import PDFUploader from './PDFUploader'

interface Props {
  categoryId?: string
  onSongCreated: (songId: string) => void
  onClose: () => void
}

export default function CreateSongModal({ categoryId, onSongCreated, onClose }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    lyrics: '',
    chords: '',
    audio_url: '',
    youtube_url: '',
    cifraclub_url: '',
    category_id: categoryId || ''
  })
  const [importing, setImporting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('songs')
        .insert([formData])
        .select()
        .single()

      if (error) throw error
      onSongCreated(data.id)
    } catch (error) {
      console.error('Error creating song:', error)
    }
  }

  const importFromCifraClub = async () => {
    if (!formData.cifraclub_url) return
    
    setImporting(true)
    try {
      const response = await fetch('/api/scraping/cifraclub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.cifraclub_url })
      })
      
      const data = await response.json()
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        artist: data.artist || prev.artist,
        chords: data.chords || prev.chords,
        lyrics: data.lyrics || prev.lyrics
      }))
    } catch (error) {
      console.error('Error importing from CifraClub:', error)
    } finally {
      setImporting(false)
    }
  }

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const onSongImported = (data: any) => {
    setFormData(prev => ({
      ...prev,
      title: data.title || prev.title,
      artist: data.artist || prev.artist,
      chords: data.chords || prev.chords,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-black">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Criar Nova Música</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Artista</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({...formData, artist: e.target.value})}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Links externos */}
          <div className="space-y-4">
            <h3 className="font-medium">Links Externos</h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">URL do CifraClub</label>
                  <input
                    type="url"
                    value={formData.cifraclub_url}
                    onChange={(e) => setFormData({...formData, cifraclub_url: e.target.value})}
                    placeholder="https://www.cifraclub.com.br/..."
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={importFromCifraClub}
                  disabled={!formData.cifraclub_url || importing}
                  className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  {importing ? 'Importando...' : 'Importar'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL do YouTube</label>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL do Áudio</label>
                <input
                  type="url"
                  value={formData.audio_url}
                  onChange={(e) => setFormData({...formData, audio_url: e.target.value})}
                  placeholder="https://..."
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label>Upload de arquivo</label>
                <PDFUploader onSongImported={onSongImported}/>
              </div>
            </div>
          </div>

          <div className="">
            <div>
              <label className="block text-sm font-medium mb-1">Cifras</label>
              <textarea
                value={formData.chords}
                onChange={(e) => setFormData({...formData, chords: e.target.value})}
                rows={12}
                className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                placeholder="Digite as cifras..."
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded-lg"
            >
              Criar Música
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}