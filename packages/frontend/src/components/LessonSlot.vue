<template>
  <div class="lesson-slot" :class="{ reserved: isReserved, processing: isProcessing }">
    <div class="slot-info">
      <p class="slot-time">{{ slot.time }}</p>
      <p class="slot-status">
        {{ isReserved ? '予約済み' : '空き' }}
      </p>
    </div>
    <button 
      v-if="!isReserved"
      @click="handleReserve"
      class="reserve-button"
      :disabled="isProcessing"
    >
      {{ isProcessing ? '処理中...' : '予約する' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Slot } from 'shared/types'

interface Props {
  slot: Slot
}

interface Emits {
  (e: 'reserve', slotId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 楽観的UI更新のためのローカル状態
const isOptimisticallyReserved = ref(false)
const isProcessing = ref(false)

// 表示用の予約状態（楽観的更新を考慮）
const isReserved = computed(() => props.slot.reserved || isOptimisticallyReserved.value)

const handleReserve = () => {
  // 既に処理中なら何もしない
  if (isProcessing.value) return
  
  // 楽観的UI更新
  isOptimisticallyReserved.value = true
  isProcessing.value = true
  
  // 親コンポーネントに通知
  emit('reserve', props.slot.id)
  
  // 処理完了後の状態リセット（親がpropを更新するまでの間）
  setTimeout(() => {
    isProcessing.value = false
  }, 300)
}

// エラー時のロールバック用
defineExpose({
  rollback: () => {
    isOptimisticallyReserved.value = false
    isProcessing.value = false
  }
})
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

.lesson-slot.processing {
  opacity: 0.9;
  transition: opacity 0.2s;
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

.reserve-button:hover:not(:disabled) {
  background-color: #45a049;
}

.reserve-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}
</style>