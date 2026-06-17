import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { BookWish, BookWishForm } from '@/types/book'

export const useBookWishlistStore = defineStore(
  'bookWishlist',
  () => {
    const wishes = ref<BookWish[]>([])

    function addWish(form: BookWishForm) {
      const wish: BookWish = {
        id: crypto.randomUUID(),
        ...form,
      }
      wishes.value.push(wish)
    }

    function updateWish(id: string, form: BookWishForm) {
      const index = wishes.value.findIndex((w) => w.id === id)
      if (index !== -1) {
        wishes.value[index] = { id, ...form }
      }
    }

    function removeWish(id: string) {
      wishes.value = wishes.value.filter((w) => w.id !== id)
    }

    function getWishById(id: string): BookWish | undefined {
      return wishes.value.find((w) => w.id === id)
    }

    return {
      wishes,
      addWish,
      updateWish,
      removeWish,
      getWishById,
    }
  },
  {
    persist: {
      key: 'book-journal-wishlist',
      storage: localStorage,
    },
  }
)
