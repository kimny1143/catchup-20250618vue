<template>
  <div class="lesson-slot" :class="{ reserved: slot.reserved }">
    <div class="slot-info">
      <p class="slot-time">{{ slot.time }}</p>
      <p class="slot-status">
        {{ slot.reserved ? '予約済み' : '空き' }}
      </p>
    </div>
    <button 
      v-if="!slot.reserved"
      @click="handleReserve"
      class="reserve-button"
    >
      予約する
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Slot } from 'shared/types'

interface Props {
  slot: Slot
}

interface Emits {
  (e: 'reserve', slotId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleReserve = () => {
  emit('reserve', props.slot.id)
}
</script>

<style scoped>
.lesson-slot {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
}

.lesson-slot:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.lesson-slot.reserved {
  background-color: #f5f5f5;
  opacity: 0.7;
}

.slot-info {
  flex: 1;
}

.slot-time {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.slot-status {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.reserve-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.reserve-button:hover {
  background-color: #45a049;
}
</style>