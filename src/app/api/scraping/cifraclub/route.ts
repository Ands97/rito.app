import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio'; 

export async function POST(request: NextRequest) {
  try {
    console.log('Chegou')
    const body = await request.json(); 
    
    if (!body?.url) {
      return NextResponse.json({ error: 'URL não fornecida' }, { status: 400 });
    }

    const { data: html } = await axios.get(body.url);
    const extractedData = extractData(html);
    
    return NextResponse.json(extractedData); 
  } catch (error) {
    console.error('Erro ao processar URL ou fazer scraping:', error);
    return NextResponse.json({ error: 'Erro ao processar a requisição' }, { status: 500 });
  }
}

function extractData(html: string) {
  const $ = cheerio.load(html);
  const title = $('h1.t1').text().trim();
  const artist = $('h2.t3').text().trim();
  const chords = $('pre').text().trim();
  return { title, artist, chords }; 
}