<template>
  <div>
    <!-- Header -->
    <header>
      <div class="hi">
        <h1>Guia de Eventos de Games — Brasil</h1>
        <p>Calendário completo de eventos em todo o Brasil.</p>
        <p class="subtitle-small">Clica em qualquer card para ver detalhes de participação e custo de stand.</p>
      </div>
    </header>

    <!-- Stats bar -->
    <div class="stats-bar">
      <div class="stat"><span class="stat-num">{{ store.total }}</span><span class="stat-label">eventos</span></div>
      <div class="stat"><span class="stat-num">{{ store.totalFree }}</span><span class="stat-label">gratuitos</span></div>
      <div class="stat"><span class="stat-num">{{ store.totalIndie }}</span><span class="stat-label">aceitam indie</span></div>
      <div class="stat"><span class="stat-num">{{ filtered.length }}</span><span class="stat-label">a mostrar</span></div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <div class="controls-inner">
        <!-- Search -->
        <IconField class="search-field">
          <InputIcon class="pi pi-search" />
          <InputText v-model="search" placeholder="Pesquisar evento, cidade, estado..." class="w-full" />
        </IconField>

        <!-- Category filters -->
        <div class="filter-row">
          <span class="filter-label">Categoria:</span>
          <div class="filter-chips">
            <button
              v-for="cat in ['Todos', ...CATEGORIES]"
              :key="cat"
              class="chip"
              :class="{ active: activeCategory === (cat === 'Todos' ? 'all' : cat) }"
              @click="activeCategory = cat === 'Todos' ? 'all' : cat"
            >{{ cat }}</button>
          </div>
        </div>

        <!-- Month + State selects -->
        <div class="filter-row">
          <span class="filter-label">Mês:</span>
          <Select v-model="activeMonth" :options="[{ code: 'all', label: 'Todos os meses' }, ...MONTHS]" option-label="label" option-value="code" class="select-sm" />
          <span class="filter-label" style="margin-left: 0.75rem">Estado:</span>
          <Select v-model="activeState" :options="[{ code: 'all', label: 'Todos' }, ...STATES]" option-label="label" option-value="code" class="select-sm" />
        </div>
      </div>
    </div>

    <!-- Main content -->
    <main>
      <div class="list-header">
        <p class="result-count">{{ filtered.length }} evento{{ filtered.length !== 1 ? 's' : '' }} encontrado{{ filtered.length !== 1 ? 's' : '' }}</p>
        <Button label="Adicionar evento" icon="pi pi-plus" @click="showAdd = true" />
      </div>

      <div v-if="store.loading" class="loading">
        <ProgressSpinner />
      </div>

      <div v-else-if="filtered.length === 0" class="empty">
        <i class="pi pi-search" style="font-size: 2rem; color: var(--p-text-muted-color)" />
        <p>Nenhum evento encontrado. Tenta outro filtro.</p>
      </div>

      <TransitionGroup v-else name="list" tag="div" class="event-list">
        <EventCard v-for="event in filtered" :key="event.name + event.date" :event="event" />
      </TransitionGroup>
    </main>

    <footer>
      Fontes: GameAgenda.com.br · gamescom latam · BGS · BIG Festival · Brasília Game Festival · Dev Game Show · Indie Brazil Showcase · RetroCon · Canal3 Expo<br>
      Atualizado: Julho 2026 · Mais eventos:
      <a href="https://www.gameagenda.com.br/eventos/nacionais" target="_blank" rel="noopener">gameagenda.com.br</a>
    </footer>

    <Toast />
    <AddEventDialog v-model="showAdd" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import EventCard from '../components/EventCard.vue'
import AddEventDialog from '../components/AddEventDialog.vue'
import { useEventsStore } from '../stores/events'
import { CATEGORIES, STATES, MONTHS } from '../data/events'

const store = useEventsStore()
const search = ref('')
const activeCategory = ref('all')
const activeMonth = ref('all')
const activeState = ref('all')
const showAdd = ref(false)

onMounted(() => store.fetchFromSupabase())

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return store.events
    .filter(e => {
      if (activeCategory.value !== 'all' && e.category !== activeCategory.value) return false
      if (activeState.value !== 'all' && e.state !== activeState.value) return false
      if (activeMonth.value !== 'all') {
        if (activeMonth.value === 'Rec' && !e.date.includes('Recorrente') && !e.date.includes('2027')) return false
        else if (activeMonth.value === '2027' && !e.date.includes('2027')) return false
        else if (!['Rec', '2027'].includes(activeMonth.value) && !e.date.includes(activeMonth.value)) return false
      }
      if (q && !`${e.name} ${e.city} ${e.state} ${e.category} ${e.notes || ''} ${e.date}`.toLowerCase().includes(q)) return false
      return true
    })
    .sort((a, b) => (a.sort_order || 99999999) - (b.sort_order || 99999999))
})
</script>

<style scoped>
header {
  background: #1a2744;
  color: #fff;
  padding: 2.5rem 2rem 2rem;
}
.hi { max-width: 1100px; margin: 0 auto; text-align: center; }
header h1 { font-size: clamp(1.4rem, 4vw, 2rem); font-weight: 700; margin-bottom: 0.5rem; }
header p { font-size: 0.9rem; opacity: 0.75; }
header .subtitle-small { font-size: 0.8rem; opacity: 0.55; margin-top: 0.25rem; }

.stats-bar {
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-200);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  max-width: 100%;
}
.stat {
  padding: 1.25rem 1.5rem;
  text-align: center;
  border-right: 1px solid var(--p-surface-200);
}
.stat:last-child { border-right: none; }
.stat-num { display: block; font-size: 1.75rem; font-weight: 700; color: #1a2744; }
.stat-label { font-size: 0.75rem; color: var(--p-text-muted-color); text-transform: uppercase; letter-spacing: 0.04em; }

.controls {
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-200);
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.controls-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.75rem; }
.search-field { width: 100%; }
.w-full { width: 100%; }

.filter-row { display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center; }
.filter-label { font-size: 0.7rem; font-weight: 600; color: var(--p-text-muted-color); text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; margin-right: 0.25rem; }

.filter-chips { display: flex; gap: 0.35rem; flex-wrap: wrap; }
.chip {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--p-surface-200);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--p-text-muted-color);
  background: var(--p-surface-0);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.chip:hover { border-color: var(--p-primary-color); color: var(--p-primary-color); }
.chip.active { background: #1a2744; color: #fff; border-color: #1a2744; }

.select-sm { font-size: 0.75rem; }

main { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }

.list-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.result-count { font-size: 0.85rem; color: var(--p-text-muted-color); }

.event-list { display: flex; flex-direction: column; gap: 0.6rem; }

.loading, .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem 2rem; color: var(--p-text-muted-color); }

footer {
  text-align: center;
  padding: 2rem;
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  border-top: 1px solid var(--p-surface-200);
  margin-top: 2rem;
}
footer a { color: var(--p-primary-color); }

.list-enter-active, .list-leave-active { transition: all 0.2s; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(-4px); }

@media (max-width: 600px) {
  header { padding: 1.5rem 1rem 1.25rem; }
  main { padding: 1rem; }
  .controls { padding: 0.75rem 1rem; }
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
}
</style>
