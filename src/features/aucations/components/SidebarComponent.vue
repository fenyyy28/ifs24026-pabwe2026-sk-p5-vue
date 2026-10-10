<script setup>
import { RouterLink } from 'vue-router'
import { CircleUser, Gavel, LayoutDashboard, Package, Users, X } from 'lucide-vue-next'

defineProps({
  open: { type: Boolean, default: false },
})

defineEmits(['close'])

const menus = [
  { to: '/', label: 'Dashboard Lelang', icon: LayoutDashboard },
  { to: '/my', label: 'Lelang Saya', icon: Package },
  { to: '/users', label: 'Daftar Pengguna', icon: Users },
  { to: '/profile', label: 'Profil Saya', icon: CircleUser },
]
</script>

<template>
  <div
    v-if="open"
    data-testid="sidebar-backdrop"
    class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
    @click="$emit('close')"
  />

  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex h-16 items-center justify-between px-5">
      <RouterLink to="/" class="flex items-center gap-2.5 font-bold text-slate-900">
        <span class="grid size-9 place-items-center rounded-lg bg-indigo-600 text-white">
          <Gavel class="size-5" />
        </span>
        Delcom Auction
      </RouterLink>
      <button
        type="button"
        aria-label="Tutup menu"
        class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
        @click="$emit('close')"
      >
        <X class="size-5" />
      </button>
    </div>

    <nav aria-label="Menu utama" class="flex-1 space-y-1 px-3 py-4">
      <RouterLink
        v-for="menu in menus"
        :key="menu.to"
        :to="menu.to"
        exact-active-class="bg-indigo-50 text-indigo-700"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        @click="$emit('close')"
      >
        <component :is="menu.icon" class="size-5" />
        {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>