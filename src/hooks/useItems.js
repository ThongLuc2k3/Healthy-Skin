import { useEffect, useState } from 'react'
import { apiClient } from '../lib/apiClient'
import skincareFallback from '../data/skincare_ingredients.json'
import foodFallback from '../data/food_items.json'

export function useItems() {
  const [state, setState] = useState({
    skincare: skincareFallback,
    food: foodFallback,
    loading: true,
    offline: false,
  })

  useEffect(() => {
    let cancelled = false

    Promise.all([apiClient.get('/items/skincare'), apiClient.get('/items/food')])
      .then(([skincare, food]) => {
        if (cancelled) return
        setState({ skincare, food, loading: false, offline: false })
      })
      .catch(() => {
        if (cancelled) return
        setState({ skincare: skincareFallback, food: foodFallback, loading: false, offline: true })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
