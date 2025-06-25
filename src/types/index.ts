export interface Category {
    id: string
    name: string
    order_index: number
  }
  
  export interface Song {
    id: string
    title: string
    artist?: string
    lyrics?: string
    chords?: string
    audio_url?: string
    youtube_url?: string
    cifraclub_url?: string
    category_id?: string
  }
  
  export interface Mass {
    id: string
    title: string
    description?: string
    mass_date: string
    liturgical_context?: string
  }
  
  export interface MassSong {
    id: string
    mass_id: string
    song_id: string
    category_id: string
    order_index: number
    notes?: string
    song?: Song
    category?: Category
  }