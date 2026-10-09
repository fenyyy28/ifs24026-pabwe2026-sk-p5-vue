<script setup>
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Mail, Lock, LoaderCircle } from 'lucide-vue-next'
import AuthLayout from '../layouts/AuthLayout.vue'
import AuthField from '../components/AuthField.vue'
import { useAuthStore } from '../states/authStore'
import { validateEmail, validateRequired } from '../utils/validators'
import { useInput } from '../../../hooks/useInput'
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper'

const router = useRouter()
const auth = useAuthStore()

const { value: email, handleChange: onEmailChange } = useInput()
const { value: password, handleChange: onPasswordChange } = useInput()
const errors = reactive({ email: '', password: '' })

async function handleSubmit() {
  errors.email = validateEmail(email.value)
  errors.password = validateRequired(password.value, 'Kata sandi')
  if (errors.email || errors.password) return

  const isSuccess = await auth.login({
    email: email.value.trim(),
    password: password.value,
  })

  if (!isSuccess) {
    await showErrorDialog(auth.message)
    return
  }

  await showSuccessDialog(auth.message)
  router.push('/')
}
</script>

<template>
  <AuthLayout
    title="Selamat datang kembali"
    subtitle="Masuk untuk mulai mengikuti lelang."
  >
    <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
      <AuthField
        id="login-email-input"
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
        id="login-password-input"
        label="Kata sandi"
        type="password"
        placeholder="Masukkan kata sandi"
        autocomplete="current-password"
        :icon="Lock"
        :value="password"
        :error="errors.password"
        @input="onPasswordChange"
      />

      <button
        id="login-submit-button"
        type="submit"
        :disabled="auth.isLoading"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LoaderCircle v-if="auth.isLoading" class="size-4 animate-spin" />
        {{ auth.isLoading ? 'Memproses...' : 'Masuk' }}
      </button>
    </form>

    <template #footer>
      Belum punya akun?
      <RouterLink
        to="/auth/register"
        class="font-semibold text-indigo-600 hover:text-indigo-700"
      >
        Daftar sekarang
      </RouterLink>
    </template>
  </AuthLayout>
</template>