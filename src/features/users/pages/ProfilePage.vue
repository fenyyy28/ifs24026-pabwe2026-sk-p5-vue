<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Camera, Lock, LoaderCircle, Mail, User } from 'lucide-vue-next'
import AuthField from '../../auth/components/AuthField.vue'
import UserAvatar from '../components/UserAvatar.vue'
import { useUsersStore } from '../states/usersStore'
import {
  validateConfirmPassword,
  validateEmail,
  validatePassword,
  validateRequired,
} from '../../auth/utils/validators'
import { useInput } from '../../../hooks/useInput'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'

const MAX_PHOTO_SIZE = 2 * 1024 * 1024

const store = useUsersStore()
const fileInput = ref(null)

const { value: name, handleChange: onNameChange } = useInput()
const { value: email, handleChange: onEmailChange } = useInput()
const {
  value: newPassword,
  handleChange: onNewPasswordChange,
  reset: resetNewPassword,
} = useInput()
const {
  value: confirmPassword,
  handleChange: onConfirmChange,
  reset: resetConfirmPassword,
} = useInput()

const profileErrors = reactive({ name: '', email: '' })
const passwordErrors = reactive({ password: '', confirmPassword: '' })

function syncForm() {
  name.value = store.profile.name
  email.value = store.profile.email
}

onMounted(async () => {
  const isSuccess = await store.fetchProfile()
  if (!isSuccess) {
    await showErrorDialog(store.message)
    return
  }
  syncForm()
})

async function handleProfileSubmit() {
  profileErrors.name = validateRequired(name.value, 'Nama')
  profileErrors.email = validateEmail(email.value)
  if (profileErrors.name || profileErrors.email) return

  const isSuccess = await store.updateProfile({
    name: name.value.trim(),
    email: email.value.trim(),
  })

  if (!isSuccess) {
    await showErrorDialog(store.message)
    return
  }

  syncForm()
  await showSuccessDialog(store.message)
}

async function handlePasswordSubmit() {
  passwordErrors.password = validatePassword(newPassword.value)
  passwordErrors.confirmPassword = validateConfirmPassword(
    newPassword.value,
    confirmPassword.value,
  )
  if (passwordErrors.password || passwordErrors.confirmPassword) return

  const isSuccess = await store.changePassword({ password: newPassword.value })

  if (!isSuccess) {
    await showErrorDialog(store.message)
    return
  }

  resetNewPassword()
  resetConfirmPassword()
  await showSuccessDialog(store.message)
}

async function handlePhotoChange(event) {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return

  if (!file.type.startsWith('image/')) {
    await showErrorDialog('File harus berupa gambar')
    return
  }

  if (file.size > MAX_PHOTO_SIZE) {
    await showErrorDialog('Ukuran foto maksimal 2 MB')
    return
  }

  const isSuccess = await store.changePhoto(file)
  if (!isSuccess) {
    await showErrorDialog(store.message)
    return
  }

  await showSuccessDialog(store.message)
}
</script>

<template>
  <section class="mx-auto max-w-3xl px-6 py-10">
    <h1 class="text-2xl font-bold text-slate-900">Profil Saya</h1>
    <p class="mt-1 text-sm text-slate-500">
      Kelola informasi akun, foto, dan kata sandimu.
    </p>

    <div v-if="store.isLoading" class="mt-8 space-y-4">
      <div v-for="n in 3" :key="n" class="h-40 animate-pulse rounded-2xl bg-slate-200" />
    </div>

    <div v-else-if="store.profile" class="mt-8 space-y-6">
      <div
        class="flex flex-col items-center gap-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row"
      >
        <UserAvatar
          :name="store.profile.name"
          :photo="store.profile.photo"
          size-class="size-24 text-3xl"
        />
        <div class="text-center sm:text-left">
          <p class="text-lg font-semibold text-slate-900">{{ store.profile.name }}</p>
          <p class="text-sm text-slate-500">{{ store.profile.email }}</p>
          <button
            type="button"
            :disabled="store.isMutating"
            class="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            @click="fileInput.click()"
          >
            <Camera class="size-4" />
            Ganti foto
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handlePhotoChange"
          />
        </div>
      </div>

      <form
        id="profile-form"
        class="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        novalidate
        @submit.prevent="handleProfileSubmit"
      >
        <h2 class="text-base font-semibold text-slate-900">Informasi profil</h2>
        <AuthField
          id="name"
          label="Nama"
          autocomplete="name"
          :icon="User"
          :value="name"
          :error="profileErrors.name"
          @input="onNameChange"
        />
        <AuthField
          id="email"
          label="Email"
          type="email"
          autocomplete="email"
          :icon="Mail"
          :value="email"
          :error="profileErrors.email"
          @input="onEmailChange"
        />
        <button
          type="submit"
          :disabled="store.isMutating"
          class="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LoaderCircle v-if="store.isMutating" class="size-4 animate-spin" />
          {{ store.isMutating ? 'Menyimpan...' : 'Simpan perubahan' }}
        </button>
      </form>

      <form
        id="password-form"
        class="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        novalidate
        @submit.prevent="handlePasswordSubmit"
      >
        <h2 class="text-base font-semibold text-slate-900">Ganti kata sandi</h2>
        <AuthField
          id="new-password"
          label="Kata sandi baru"
          type="password"
          placeholder="Minimal 6 karakter"
          autocomplete="new-password"
          :icon="Lock"
          :value="newPassword"
          :error="passwordErrors.password"
          @input="onNewPasswordChange"
        />
        <AuthField
          id="confirm-password"
          label="Konfirmasi kata sandi baru"
          type="password"
          placeholder="Ulangi kata sandi baru"
          autocomplete="new-password"
          :icon="Lock"
          :value="confirmPassword"
          :error="passwordErrors.confirmPassword"
          @input="onConfirmChange"
        />
        <button
          type="submit"
          :disabled="store.isMutating"
          class="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LoaderCircle v-if="store.isMutating" class="size-4 animate-spin" />
          {{ store.isMutating ? 'Menyimpan...' : 'Ubah kata sandi' }}
        </button>
      </form>
    </div>

    <p
      v-else
      class="mt-8 rounded-2xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200"
    >
      Profil tidak dapat dimuat.
    </p>
  </section>
</template>