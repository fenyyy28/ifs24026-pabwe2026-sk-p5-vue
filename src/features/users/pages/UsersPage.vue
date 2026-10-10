<script setup>
import { computed, onMounted } from 'vue'
import { Search, X } from 'lucide-vue-next'
import UserAvatar from '../components/UserAvatar.vue'
import { useUsersStore } from '../states/usersStore'
import { useInput } from '../../../hooks/useInput'
import { showErrorDialog } from '../../../helpers/toolsHelper'

const store = useUsersStore()
const { value: keyword, handleChange: onKeywordChange } = useInput()

const filteredUsers = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return store.users

  return store.users.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query),
  )
})

onMounted(async () => {
  const isSuccess = await store.fetchUsers()
  if (!isSuccess) {
    await showErrorDialog(store.message)
  }
})
</script>

<template>
  <section class="mx-auto max-w-5xl px-6 py-10">
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Pengguna</h1>
        <p class="mt-1 text-sm text-slate-500">
          Daftar semua pengguna yang terdaftar di Delcom Auction.
        </p>
      </div>

      <div class="relative w-full sm:w-72">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600"
        />
        <input
          id="keyword"
          type="search"
          :value="keyword"
          placeholder="Cari nama atau email"
          class="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          @input="onKeywordChange"
        />
      </div>
    </header>

    <article
      v-if="store.user"
      data-testid="user-detail"
      class="mt-6 flex items-center gap-4 rounded-2xl bg-indigo-50 p-5 ring-1 ring-indigo-100"
    >
      <UserAvatar
        :name="store.user.name"
        :photo="store.user.photo"
        size-class="size-16 text-xl"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-lg font-semibold text-slate-900">{{ store.user.name }}</p>
        <p class="truncate text-sm text-slate-600">{{ store.user.email }}</p>
      </div>
      <button
        type="button"
        aria-label="Tutup detail"
        class="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
        @click="store.clearUser()"
      >
        <X class="size-5" />
      </button>
    </article>

    <ul v-if="store.isLoading" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="n in 6"
        :key="n"
        class="h-20 animate-pulse rounded-2xl bg-slate-200"
      />
    </ul>

    <p
      v-else-if="filteredUsers.length === 0"
      class="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200"
    >
      Pengguna tidak ditemukan.
    </p>

    <ul v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="item in filteredUsers" :key="item.id">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200 transition hover:shadow-md hover:ring-indigo-300"
          @click="store.selectUser(item.id)"
        >
          <UserAvatar :name="item.name" :photo="item.photo" />
          <span class="min-w-0">
            <span class="block truncate font-semibold text-slate-900">{{ item.name }}</span>
            <span class="block truncate text-sm text-slate-500">{{ item.email }}</span>
          </span>
        </button>
      </li>
    </ul>
  </section>
</template>