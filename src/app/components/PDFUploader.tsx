'use client'
import { useState } from 'react'
import { Upload, FileText, Loader2 } from 'lucide-react'

interface PDFUploaderProps {
  onSongImported: (song: any) => void;
}

export default function PDFUploader({ onSongImported }: PDFUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFiles = async (files: FileList) => {
    if (!files.length) return

    setUploading(true)
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type === 'application/pdf') {
        await processPDFFile(file)
      }
    }
    
    setUploading(false)
  }

  const processPDFFile = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('pdf', file)
      
      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData
      })
      
      const { extractedData } = await response.json()
      
      const songData = {
        title: extractedData.title || file.name.replace('.pdf', ''),
        artist: extractedData.artist || '',
        chords: extractedData.chords || '',
        category_id: extractedData.suggestedCategory || null
      }

      onSongImported(songData)
      
    } catch (error) {
      console.error('Erro ao processar PDF:', error)
      alert('Erro ao processar o arquivo: ' + file.name)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500 mb-2" />
            <p>Processando PDFs...</p>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Arraste seus PDFs aqui ou clique para selecionar
            </h3>
            <p className="text-gray-500 mb-4">
              Suporte para múltiplos arquivos PDF
            </p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700"
            >
              Selecionar Arquivos
            </label>
          </>
        )}
      </div>
    </div>
  )
}