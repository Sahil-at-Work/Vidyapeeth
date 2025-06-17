import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { SubjectMaterial } from '../types'

export function useSubjectMaterials(subjectId: string | undefined) {
  const [materials, setMaterials] = useState<SubjectMaterial | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (subjectId) {
      fetchMaterials()
    }
  }, [subjectId])

  const fetchMaterials = async () => {
    if (!subjectId) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('subject_materials')
        .select('*')
        .eq('subject_id', subjectId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching materials:', error)
      } else {
        setMaterials(data)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    materials,
    loading,
    refetch: fetchMaterials
  }
}