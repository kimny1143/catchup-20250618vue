<template>
  <div class="slots-view">
    <div v-if="loading" class="loading">読み込み中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="slots-list">
      <LessonSlot
        v-for="slot in slots"
        :key="slot.id"
        :slot="slot"
        @reserve="handleReserve"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import LessonSlot from '../components/LessonSlot.vue'
import type { Slot } from 'shared/types'

const slots = ref<Slot[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchSlots = async () => {
  try {
    loading.value = true
    const response = await axios.get<Slot[]>('/api/slots')
    slots.value = response.data
  } catch (err) {
    error.value = 'スロットの取得に失敗しました'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleReserve = async (slotId: string) => {
  try {
    const response = await axios.post<Slot>(`/api/slots/${slotId}/reserve`)
    const index = slots.value.findIndex(s => s.id === slotId)
    if (index !== -1) {
      slots.value[index] = response.data
    }
  } catch (err) {
    alert('予約に失敗しました')
    console.error(err)
  }
}

onMounted(() => {
  fetchSlots()
})
</script>

<style scoped>
.slots-view {
  max-width: 600px;
  margin: 0 auto;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

.error {
  color: #f44336;
}

.slots-list {
  margin-top: 20px;
}
</style>