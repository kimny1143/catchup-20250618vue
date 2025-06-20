<template>
  <div class="slots-view">
    <div v-if="loading" class="loading">読み込み中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="slots-list">
      <LessonSlot
        v-for="slot in slots"
        :key="slot.id"
        :ref="(el) => setSlotRef(slot.id, el)"
        :slot="slot"
        @reserve="handleReserve"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import LessonSlot from '../components/LessonSlot.vue'
import type { Slot } from 'shared/types'
import { useSlotCache } from '../composables/useSlotCache'

const toast = useToast()
const { cachedSlots, isCacheValid, updateCache, updateSlot, loadFromLocalStorage, saveToLocalStorage } = useSlotCache()
const slots = ref<Slot[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchSlots = async (forceRefresh = false) => {
  try {
    // キャッシュが有効で強制リフレッシュでない場合
    if (isCacheValid.value && !forceRefresh) {
      slots.value = cachedSlots.value
      loading.value = false
      toast.info('キャッシュからデータを読み込みました')
      return
    }

    loading.value = true
    const response = await axios.get<Slot[]>('/api/slots')
    slots.value = response.data
    
    // キャッシュを更新
    updateCache(response.data)
    saveToLocalStorage()
    
    if (forceRefresh) {
      toast.success('データを更新しました')
    }
  } catch (err) {
    error.value = 'スロットの取得に失敗しました'
    console.error(err)
    
    // エラー時はキャッシュから読み込み
    if (cachedSlots.value.length > 0) {
      slots.value = cachedSlots.value
      toast.warning('オフラインモード: キャッシュデータを表示しています')
    }
  } finally {
    loading.value = false
  }
}

// 子コンポーネントのref管理（ロールバック用）
const slotRefs = ref<Map<string, any>>(new Map())

const handleReserve = async (slotId: string) => {
  // 楽観的にUIを更新（子コンポーネントで既に実行されている）
  const originalSlot = slots.value.find(s => s.id === slotId)
  if (!originalSlot) return
  
  try {
    const response = await axios.post<Slot>(`/api/slots/${slotId}/reserve`)
    const index = slots.value.findIndex(s => s.id === slotId)
    if (index !== -1) {
      // サーバーからの応答でデータを正式に更新
      slots.value[index] = response.data
      
      // キャッシュも更新
      updateSlot(slotId, { reserved: true })
      saveToLocalStorage()
      
      // 成功トースト表示
      toast.success(`スロット ${response.data.time} の予約が完了しました！`)
    }
  } catch (err: any) {
    // エラー時は楽観的更新をロールバック
    const slotComponent = slotRefs.value.get(slotId)
    if (slotComponent && slotComponent.rollback) {
      slotComponent.rollback()
    }
    
    // エラーの種類に応じてトースト表示
    if (err.response?.status === 400) {
      toast.warning('このスロットは既に予約されています')
    } else if (err.response?.status === 404) {
      toast.error('スロットが見つかりません')
    } else if (err.response?.status === 409) {
      toast.error('選択した時間帯は他の予約と競合しています')
    } else {
      toast.error('予約に失敗しました。もう一度お試しください')
    }
    console.error(err)
    
    // データを再フェッチして最新状態を取得
    await fetchSlots(true)
  }
}

// 子コンポーネントのrefを設定
const setSlotRef = (slotId: string, ref: any) => {
  if (ref) {
    slotRefs.value.set(slotId, ref)
  } else {
    slotRefs.value.delete(slotId)
  }
}

onMounted(() => {
  // ローカルストレージから読み込み
  loadFromLocalStorage()
  
  // データを取得
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