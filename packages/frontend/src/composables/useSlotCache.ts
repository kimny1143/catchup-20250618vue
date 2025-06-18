import { ref, computed } from 'vue'
import type { Slot } from 'shared/types'

// グローバルなキャッシュストア
const cachedSlots = ref<Slot[]>([])
const lastFetchTime = ref<number>(0)
const CACHE_DURATION = 30000 // 30秒

export function useSlotCache() {
  // キャッシュが有効かチェック
  const isCacheValid = computed(() => {
    return Date.now() - lastFetchTime.value < CACHE_DURATION
  })

  // キャッシュを更新
  const updateCache = (slots: Slot[]) => {
    cachedSlots.value = [...slots]
    lastFetchTime.value = Date.now()
  }

  // 特定のスロットを更新
  const updateSlot = (slotId: string, updates: Partial<Slot>) => {
    const index = cachedSlots.value.findIndex(s => s.id === slotId)
    if (index !== -1) {
      cachedSlots.value[index] = {
        ...cachedSlots.value[index],
        ...updates
      }
    }
  }

  // キャッシュをクリア
  const clearCache = () => {
    cachedSlots.value = []
    lastFetchTime.value = 0
  }

  // ローカルストレージに保存
  const saveToLocalStorage = () => {
    const data = {
      slots: cachedSlots.value,
      timestamp: lastFetchTime.value
    }
    localStorage.setItem('slot-cache', JSON.stringify(data))
  }

  // ローカルストレージから読み込み
  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('slot-cache')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        cachedSlots.value = data.slots || []
        lastFetchTime.value = data.timestamp || 0
      } catch (e) {
        console.error('Failed to load cache from localStorage', e)
      }
    }
  }

  return {
    cachedSlots: computed(() => cachedSlots.value),
    isCacheValid,
    updateCache,
    updateSlot,
    clearCache,
    saveToLocalStorage,
    loadFromLocalStorage
  }
}