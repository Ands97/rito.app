'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import CategorySection from '../../../components/CategorySection'
import { Loading } from '@/app/components/Loading'
import { Header } from '@/app/components/Header'
import { Mass } from '@/types'

export default function EditMassPage() {
  const params = useParams()
  const [mass, setMass] = useState<Mass | null>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [massSongs, setMassSongs] = useState<any[]>([])

  useEffect(() => {
    if (params.id) {
      fetchMassData()
      fetchCategories()
    }
  }, [params.id])

  const fetchMassData = async () => {
    const { data } = await supabase
      .from('masses')
      .select('*')
      .eq('id', params.id)
      .single()
    setMass(data)

    const { data: songs } = await supabase
      .from('mass_songs')
      .select(`
        *,
        song:songs(*),
        category:categories(*)
      `)
      .eq('mass_id', params.id)
      .order('order_index')
    setMassSongs(songs || [])
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('order_index')
    setCategories(data || [])
  }

  if (!mass) return <Loading />

  return (
    <div className="container mx-auto p-6 text-black min-h-screen bg-gray-900">
      <Header />
      <h1 className="text-3xl font-bold mb-6 text-white">{mass.title}</h1>
      
      {categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          massId={params.id}
          massSongs={massSongs.filter(ms => ms.category_id === category.id)}
          onUpdate={fetchMassData}
        />
      ))}
    </div>
  )
}