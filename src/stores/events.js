import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { STATIC_EVENTS } from '../data/events'

export const useEventsStore = defineStore('events', () => {
  const events = ref([...STATIC_EVENTS])
  const loading = ref(false)
  const error = ref(null)

  async function fetchFromSupabase() {
    if (!supabase) return
    loading.value = true
    const { data, error: err } = await supabase
      .from('events')
      .select('*')
      .order('sort_order', { ascending: true })
    loading.value = false
    if (err) { error.value = err.message; return }
    if (data && data.length > 0) events.value = data
  }

  async function addEvent(payload) {
    if (!supabase) {
      events.value.push({ ...payload, id: Date.now(), score: 5, source: 'user' })
      return { ok: true }
    }
    const { data, error: err } = await supabase
      .from('events')
      .insert([{ ...payload, source: 'user', score: 5 }])
      .select()
    if (err) return { ok: false, message: err.message }
    events.value.push(data[0])
    return { ok: true }
  }

  async function updateEvent(payload) {
    const idx = events.value.findIndex(e => e.name === payload.name && e.date === payload._originalDate)
    if (!supabase || !payload.id) {
      if (idx !== -1) events.value[idx] = { ...events.value[idx], ...payload }
      return { ok: true }
    }
    const { id, _originalDate, ...fields } = payload
    const { error: err } = await supabase.from('events').update(fields).eq('id', id)
    if (err) return { ok: false, message: err.message }
    if (idx !== -1) events.value[idx] = { ...events.value[idx], ...fields }
    else {
      const i = events.value.findIndex(e => e.id === id)
      if (i !== -1) events.value[i] = { ...events.value[i], ...fields }
    }
    return { ok: true }
  }

  const total = computed(() => events.value.length)
  const totalFree = computed(() =>
    events.value.filter(e => e.cost?.toLowerCase().includes('gratuito') || e.stand_info?.toLowerCase().includes('gratuito')).length
  )
  const totalIndie = computed(() => events.value.filter(e => e.accepts_indie).length)

  return { events, loading, error, fetchFromSupabase, addEvent, updateEvent, total, totalFree, totalIndie }
})
