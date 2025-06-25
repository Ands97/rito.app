import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    const data = await pdf(buffer)
    const extractedData = await processExtractedText(data.text, file.name)
    return NextResponse.json({ extractedData })
  } catch (error) {
    console.error('Erro ao processar PDF:', error)
    return NextResponse.json({ error: 'Erro ao processar PDF' }, { status: 500 })
  }
}

async function processExtractedText(text: string, fileName: string) {
  const lines = text.split('\n').filter(line => line.trim())
  
  const result: {
    title: string
    artist: string
    chords: string
    suggestedCategory: string
  } = {
    title: '',
    artist: '',
    chords: '',
    suggestedCategory: ''
  }

  result.title = lines[0]?.trim() || fileName.replace('.pdf', '')

  const artistLine = lines.find(line => 
    /^(por|intérprete|artist|cantor|banda):/i.test(line.trim())
  )
  if (artistLine) {
    result.artist = artistLine.split(':')[1]?.trim() || ''
  }

  result.chords = lines.slice(1).join('\n')

  result.suggestedCategory = suggestCategory(result.title, result.chords)

  return result
}

function suggestCategory(title: string, lyrics: string) {
  const content = (title + ' ' + lyrics).toLowerCase()
  
  const categories = {
    'entrada': ['entrada', 'benvindo', 'chegada', 'inicio'],
    'gloria': ['gloria', 'glória', 'louvor', 'aleluia'],
    'comunhao': ['comunhão', 'pão', 'corpo', 'sangue', 'eucaristia'],
    'final': ['final', 'envio', 'ide', 'missão', 'despedida'],
    'ofertorio': ['oferenda', 'oferta', 'dádiva', 'presente']
  }
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      return category
    }
  }
  
  return ''
}