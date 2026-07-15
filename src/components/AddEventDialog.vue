<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEdit ? 'Editar Evento' : 'Adicionar Evento'"
    :style="{ width: '560px', maxWidth: '95vw' }"
    @hide="reset"
  >
    <form @submit.prevent="submit" class="form">
      <div class="field">
        <label>Nome do evento *</label>
        <InputText v-model="form.name" placeholder="Ex: BGS 2027" required class="w-full" />
      </div>

      <div class="field-row">
        <div class="field">
          <label>Cidade *</label>
          <InputText v-model="form.city" placeholder="Ex: São Paulo" required class="w-full" />
        </div>
        <div class="field">
          <label>Estado *</label>
          <Select v-model="form.state" :options="STATES" option-label="label" option-value="code" placeholder="UF" class="w-full" />
        </div>
      </div>

      <div class="field">
        <label>Data *</label>
        <InputText v-model="form.date" placeholder="Ex: 10–12 Out 2027" required class="w-full" />
      </div>

      <div class="field-row">
        <div class="field">
          <label>Categoria *</label>
          <Select v-model="form.category" :options="CATEGORIES" placeholder="Categoria" class="w-full" />
        </div>
        <div class="field field-checkbox">
          <label>Aceita indie?</label>
          <Checkbox v-model="form.accepts_indie" binary />
        </div>
      </div>

      <div class="field">
        <label>Stand / Forma de participação</label>
        <InputText v-model="form.stand_info" placeholder="Ex: Stand pago, Candidatura gratuita..." class="w-full" />
      </div>

      <div class="field-row">
        <div class="field">
          <label>Custo</label>
          <InputText v-model="form.cost" placeholder="Ex: Gratuito, R$500..." class="w-full" />
        </div>
        <div class="field">
          <label>Público estimado</label>
          <InputText v-model="form.audience" placeholder="Ex: 10 000+" class="w-full" />
        </div>
      </div>

      <div class="field">
        <label>URL do evento</label>
        <InputText v-model="form.url" placeholder="https://..." type="url" class="w-full" />
      </div>

      <div class="field">
        <label>Notas / Descrição</label>
        <Textarea v-model="form.notes" rows="3" placeholder="Descreve o evento, o que há para devs indie..." class="w-full" />
      </div>

      <div class="form-footer">
        <Button v-if="isEdit" label="Excluir evento" icon="pi pi-trash" severity="danger" text @click="confirmDelete" :loading="deleting" />
        <div class="form-footer-right">
          <Button label="Cancelar" text @click="visible = false" />
          <Button
            :label="isEdit ? 'Salvar alterações' : 'Adicionar evento'"
            type="submit"
            :loading="saving"
            :icon="isEdit ? 'pi pi-check' : 'pi pi-plus'"
          />
        </div>
      </div>
    </form>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useEventsStore } from '../stores/events'
import { useToast } from 'primevue/usetoast'
import { CATEGORIES, STATES } from '../data/events'

const visible = defineModel({ default: false })
const props = defineProps({ event: { type: Object, default: null } })

const store = useEventsStore()
const toast = useToast()
const saving = ref(false)
const deleting = ref(false)
const showConfirmDelete = ref(false)

const isEdit = computed(() => !!props.event)

const BLANK = () => ({
  name: '', city: '', state: '', date: '', category: '',
  accepts_indie: false, stand_info: '', cost: '', audience: '', url: '', notes: '',
})

const form = ref(BLANK())

watch(() => props.event, (ev) => {
  if (ev) {
    form.value = {
      name: ev.name || '',
      city: ev.city || '',
      state: ev.state || '',
      date: ev.date || '',
      category: ev.category || '',
      accepts_indie: ev.accepts_indie || false,
      stand_info: ev.stand_info || '',
      cost: ev.cost || '',
      audience: ev.audience || '',
      url: ev.url || '',
      notes: ev.notes || '',
    }
  } else {
    form.value = BLANK()
  }
}, { immediate: true })

function reset() {
  if (!isEdit.value) form.value = BLANK()
}

async function confirmDelete() {
  if (!confirm(`Tens a certeza que queres excluir "${props.event.name}"?`)) return
  deleting.value = true
  const result = await store.deleteEvent(props.event)
  deleting.value = false
  if (result.ok) {
    toast.add({ severity: 'success', summary: 'Evento excluído', detail: props.event.name, life: 3000 })
    visible.value = false
  } else {
    toast.add({ severity: 'error', summary: 'Erro ao excluir', detail: result.message, life: 4000 })
  }
}

async function submit() {
  if (!form.value.name || !form.value.city || !form.value.state || !form.value.date || !form.value.category) {
    toast.add({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Preenche nome, cidade, estado, data e categoria.', life: 3000 })
    return
  }
  saving.value = true

  let result
  if (isEdit.value) {
    result = await store.updateEvent({ ...form.value, id: props.event.id, _originalDate: props.event.date })
  } else {
    result = await store.addEvent({ ...form.value })
  }

  saving.value = false

  if (result.ok) {
    toast.add({
      severity: 'success',
      summary: isEdit.value ? 'Evento atualizado!' : 'Evento adicionado!',
      detail: form.value.name,
      life: 3000,
    })
    visible.value = false
  } else {
    toast.add({ severity: 'error', summary: 'Erro', detail: result.message, life: 4000 })
  }
}
</script>

<style scoped>
.form { display: flex; flex-direction: column; gap: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.375rem; flex: 1; }
.field label { font-size: 0.8rem; font-weight: 600; color: var(--p-text-muted-color); }
.field-row { display: flex; gap: 0.75rem; }
.field-checkbox { justify-content: center; align-items: center; }
.form-footer { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding-top: 0.5rem; }
.form-footer-right { display: flex; gap: 0.5rem; }
.w-full { width: 100%; }
</style>
