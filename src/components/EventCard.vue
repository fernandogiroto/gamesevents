<template>
  <div class="event-card" :class="{ open }" @click="open = !open">
    <div class="card-header">
      <div class="score" :class="scoreClass">{{ event.score }}/10</div>
      <div class="card-info">
        <div class="card-title">{{ event.name }}</div>
        <div class="card-meta">
          <span><i class="pi pi-map-marker" /> {{ event.city }} — {{ event.state }}</span>
          <span><i class="pi pi-calendar" /> {{ event.date }}</span>
        </div>
        <div class="tags">
          <Tag :value="event.category" :class="catClass" rounded />
          <Tag v-if="event.accepts_indie" value="Aceita indie" severity="success" rounded />
          <Tag v-if="isFree" value="Gratuito" severity="success" rounded />
          <Tag v-if="event.source === 'user'" value="Adicionado pela comunidade" severity="secondary" rounded />
        </div>
      </div>
      <i class="pi pi-chevron-down chevron" />
    </div>

    <Transition name="expand">
      <div v-if="open" class="card-body" @click.stop>
        <div class="details-grid">
          <div>
            <div class="detail-label">Stand / Participação</div>
            <div class="detail-value">{{ event.stand_info }}</div>
          </div>
          <div>
            <div class="detail-label">Custo</div>
            <div class="detail-value">{{ event.cost }}</div>
          </div>
          <div>
            <div class="detail-label">Público estimado</div>
            <div class="detail-value">{{ event.audience }}</div>
          </div>
          <div>
            <div class="detail-label">Aceita indie</div>
            <div class="detail-value">{{ event.accepts_indie ? 'Sim' : 'Parcial/Não' }}</div>
          </div>
        </div>
        <p class="notes">{{ event.notes }}</p>
        <a v-if="event.url" :href="event.url" target="_blank" rel="noopener" class="event-link">
          <i class="pi pi-external-link" /> {{ displayUrl }}
        </a>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Tag from 'primevue/tag'

const props = defineProps({ event: Object })
const open = ref(false)

const isFree = computed(() =>
  props.event.cost?.toLowerCase().includes('gratuito') ||
  props.event.stand_info?.toLowerCase().includes('gratuito')
)

const scoreClass = computed(() => {
  const s = props.event.score
  if (s >= 10) return 'score-10'
  if (s >= 9) return 'score-9'
  if (s >= 8) return 'score-8'
  if (s >= 7) return 'score-7'
  if (s >= 6) return 'score-6'
  return 'score-5'
})

const catClass = computed(() => ({
  'Grande Feira': 'tag-grande',
  'Indie': 'tag-indie',
  'Networking/B2B': 'tag-b2b',
  'Online': 'tag-online',
  'Retro': 'tag-retro',
  'Geek/Pop': 'tag-geek',
  'Regional': 'tag-regional',
}[props.event.category] || 'tag-geek'))

const displayUrl = computed(() =>
  props.event.url?.replace(/https?:\/\//, '').split('/')[0] || ''
)
</script>

<style scoped>
.event-card {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
  cursor: pointer;
}
.event-card:hover { border-color: var(--p-surface-400); }
.event-card.open { border-color: var(--p-primary-color); }

.card-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 0.875rem 1rem;
}

.score {
  min-width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.score-10 { background: #dcfce7; color: #14532d; }
.score-9  { background: #d1fae5; color: #064e3b; }
.score-8  { background: #dbeafe; color: #1e3a8a; }
.score-7  { background: #fef9c3; color: #713f12; }
.score-6  { background: #ffedd5; color: #7c2d12; }
.score-5  { background: #fee2e2; color: #7f1d1d; }

.card-info { flex: 1; min-width: 0; }
.card-title { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.3rem; }
.card-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.4rem;
}
.card-meta span { display: flex; align-items: center; gap: 4px; }

.tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }

.chevron {
  color: var(--p-text-muted-color);
  flex-shrink: 0;
  margin-top: 4px;
  transition: transform 0.2s;
}
.open .chevron { transform: rotate(180deg); }

.card-body {
  padding: 0.875rem 1rem 1rem;
  border-top: 1px solid var(--p-surface-200);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 0.875rem;
}
.detail-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--p-text-muted-color); margin-bottom: 3px; }
.detail-value { font-size: 0.8rem; }

.notes { font-size: 0.82rem; color: var(--p-text-muted-color); line-height: 1.65; margin-bottom: 0.75rem; }

.event-link { font-size: 0.78rem; color: var(--p-primary-color); display: inline-flex; align-items: center; gap: 4px; text-decoration: none; }
.event-link:hover { text-decoration: underline; }

/* category tag overrides */
:deep(.tag-grande .p-tag) { background: #fff7ed; color: #ea580c; }
:deep(.tag-indie .p-tag)  { background: #f5f3ff; color: #7c3aed; }
:deep(.tag-b2b .p-tag)    { background: #f0fdf4; color: #16a34a; }
:deep(.tag-online .p-tag) { background: #f1f5f9; color: #475569; }
:deep(.tag-retro .p-tag)  { background: #fef3c7; color: #92400e; }
:deep(.tag-geek .p-tag)   { background: #eff6ff; color: #2563eb; }
:deep(.tag-regional .p-tag){ background: #f0fdfa; color: #0d9488; }

.expand-enter-active, .expand-leave-active { transition: opacity 0.2s; }
.expand-enter-from, .expand-leave-to { opacity: 0; }
</style>
