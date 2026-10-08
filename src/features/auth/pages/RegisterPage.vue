<script setup>
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { User, Mail, Lock, LoaderCircle } from 'lucide-vue-next'
import AuthLayout from '../layouts/AuthLayout.vue'
import AuthField from '../components/AuthField.vue'
import { useAuthStore } from '../states/authStore'
import {
  validateRequired,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validators'
import { useInput } from '../../../hooks/useInput'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'

const router = useRouter()
const auth = useAuthStore()

const { value: name, handleChange: onNameChange } = useInput()
const { value: email, handleChange: onEmailChange } = useInput()
const { value: password, handleChange: onPasswordChange } = useInput()
const { value: confirmPassword, handleChange: onConfirmChange } = useInput()
const errors = reactive({ name: '', email: '', password: '', confirmPassword: '' })

async function handleSubmit() {
  errors.name = validateRequired(name.value, 'Nama')
  errors.email = validateEmail(email.value)
  errors.password = validatePassword(password.value)
  errors.confirmPassword = validateConfirmPassword(
    password.value,
    confirmPassword.value,
  )
  if (Object.values(errors).some(Boolean)) return

  const isSuccess = await auth.register({
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
  })

  if (!isSuccess) {
    await showErrorDialog(auth.message)
    return
  }

  await showSuccessDialog(auth.message)
  router.push('/auth/login')
}
</script>

<template>
  <AuthLayout
    title="Buat akun baru"
    subtitle="Daftar untuk mulai membuat dan mengikuti lelang."
  >
    <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
      <AuthField
        id="name"
        label="Nama"
        placeholder="Nama lengkap"
        autocomplete="name"
        :icon="User"
        :value="name"
        :error="errors.name"
        @input="onNameChange"
      />
      <AuthField
        id="email"
        label="Email"
        type="email"
        placeholder="nama@email.com"
        autocomplete="email"
        :icon="Mail"
        :value="email"
        :error="errors.email"
        @input="onEmailChange"
      />
      <AuthField
        id="password"
        label="Kata sandi"
        type="password"
        placeholder="Minimal 6 karakter"
        autocomplete="new-password"
        :icon="Lock"
        :value="password"
        :error="errors.password"
        @input="onPasswordChange"
      />
      <AuthField
        id="confirmPassword"
        label="Konfirmasi kata sandi"
        type="password"
        placeholder="Ulangi kata sandi"
        autocomplete="new-password"
        :icon="Lock"
        :value="confirmPassword"
        :error="errors.confirmPassword"
        @input="onConfirmChange"
      />

      <button
        type="submit"
        :disabled="auth.isLoading"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LoaderCircle v-if="auth.isLoading" class="size-4 animate-spin" />
        {{ auth.isLoading ? 'Memproses...' : 'Daftar' }}
      </button>
    </form>

    <template #footer>
      Sudah punya akun?
      <RouterLink
        to="/auth/login"
        class="font-semibold text-indigo-600 hover:text-indigo-700"
      >
        Masuk
      </RouterLink>
    </template>
  </AuthLayout>
</template>