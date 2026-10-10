<script setup>
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Gavel, LogOut, Menu } from 'lucide-vue-next'
import UserAvatar from '../../users/components/UserAvatar.vue'
import { useAuthStore } from '../../auth/states/authStore'
import { useUsersStore } from '../../users/states/usersStore'
import { showConfirmDialog } from '../../../helpers/toolsHelper'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const auth = useAuthStore()
const users = useUsersStore()

const displayName = computed(() => (users.profile ? users.profile.name : 'Pengguna'))
const displayPhoto = computed(() => (users.profile ? users.profile.photo : ''))

onMounted(async () => {
  if (!users.profile) {
    await users.fetchProfile()
  }
})

async function handleLogout() {
  const isConfirmed = await showConfirmDialog('Kamu akan keluar dari akun ini.', {
    title: 'Keluar dari akun?',
    confirmText: 'Keluar',
  })
  if (!isConfirmed) return

  await auth.logout()
  users.clearState()
  router.push('/auth/login')
}
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6"
  >
    <button
      type="button"
      aria-label="Buka menu"
      class="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
      @click="$emit('toggle-sidebar')"
    >
      <Menu class="size-5" />
    </button>

    <RouterLink to="/" class="flex items-center gap-2 font-bold text-slate-900 lg:hidden">
      <Gavel class="size-5 text-indigo-600" />
      Delcom Auction
    </RouterLink>

    <div class="ml-auto flex items-center gap-1 sm:gap-3">
      <nav aria-label="Menu cepat" class="hidden items-center gap-1 sm:flex">
        <RouterLink
          to="/my"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Lelang Saya
        </RouterLink>
        <RouterLink
          to="/users"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          Daftar Pengguna
        </RouterLink>
      </nav>

      <RouterLink
        to="/profile"
        aria-label="Profil saya"
        class="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
      >
        <UserAvatar :name="displayName" :photo="displayPhoto" size-class="size-9 text-sm" />
        <span class="hidden max-w-40 truncate text-sm font-semibold text-slate-800 sm:block">
          {{ displayName }}
        </span>
      </RouterLink>

      <button
        type="button"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
        @click="handleLogout"
      >
        <LogOut class="size-4" />
        <span class="hidden sm:inline">Keluar</span>
      </button>
    </div>
  </header>
</template>