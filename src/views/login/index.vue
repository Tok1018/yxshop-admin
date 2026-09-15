<script setup>
import { reactive, ref } from 'vue'
import * as loginApi from '@/api/login'
import { forceChangePassword } from '@/api/profile'
import { useUserStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import PuzzleCaptcha from '@/components/PuzzleCaptcha/index.vue'
import packageJson from '../../../package.json'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const captcha = ref(null)
const loading = ref(false)
const showForcePw = ref(false)
const forcePwForm = reactive({ new_password: '', confirm_password: '' })
const forcePwLoading = ref(false)
const captchaType = ref('text')
const puzzleRef = ref(null)
const puzzleData = ref({ uuid: '', x: 0 })

const form = reactive({ username: '', password: '', code: '' })

const refreshCaptcha = () => {
  form.code = ''
  form.uuid = ''
  loginApi.getCaptcha().then((res) => {
    if (res.code === 0) {
      captchaType.value = res.data.captcha_type || 'text'
      if (captchaType.value === 'puzzle') {
        // 拼图模式由组件自动加载
        return
      }
      captcha.value = res.data.image
      form.uuid = res.data.uuid
    }
  }).catch(() => {})
}

const onPuzzleReady = (payload) => {
  puzzleData.value = { uuid: payload.uuid, x: 0 }
}

const onPuzzleDragEnd = (payload) => {
  puzzleData.value = { uuid: payload.uuid, x: payload.x }
}

refreshCaptcha()

const userStore = useUserStore()
const redirect = route.query.redirect ? route.query.redirect : '/'

const handleSubmit = async ({ values, errors }) => {
  if (loading.value) return
  loading.value = true
  if (!errors) {
    const params = { username: form.username, password: form.password }

    if (captchaType.value === 'puzzle') {
      const pzData = puzzleRef.value?.getData()
      if (!pzData || !pzData.uuid || pzData.x <= 0) {
        Message.warning(t('sys.login.puzzleDragHint'))
        loading.value = false
        return
      }
      params.puzzle_uuid = pzData.uuid
      params.puzzle_x = pzData.x
    } else {
      params.captcha_code = form.code
      params.captcha_uuid = form.uuid
    }

    const result = await userStore.login(params)
    if (!result) {
      loading.value = false
      if (captchaType.value === 'puzzle') {
        puzzleRef.value?.refresh()
      } else {
        refreshCaptcha()
      }
      return
    }
    if (result && result.require_password_change) {
      showForcePw.value = true
      loading.value = false
      return
    }
    router.push(redirect)
  }
  loading.value = false
}

const submitForcePassword = async () => {
  if (!forcePwForm.new_password || !forcePwForm.confirm_password) {
    Message.warning(t('setting.general.pwRequired'))
    return
  }
  if (forcePwForm.new_password !== forcePwForm.confirm_password) {
    Message.warning(t('setting.general.pwMismatch'))
    return
  }
  forcePwLoading.value = true
  try {
    await forceChangePassword(forcePwForm)
    Message.success(t('setting.general.pwChanged'))
    showForcePw.value = false
    userStore.logout()
    router.push('/login')
  } catch (e) {
    Message.error(e?.response?.data?.msg || t('setting.general.pwChangeFailed'))
  } finally {
    forcePwLoading.value = false
  }
}

</script>

<template>
  <div class="login-page">
    <div class="login-card card-shadow">
      <div class="login-brand">
        <h1>{{ $title }}</h1>
        <span class="version">v{{ packageJson.version }}</span>
      </div>

      <a-form :model="form" @submit="handleSubmit" class="login-form">
            <a-form-item field="username" :hide-label="true" :rules="[{ required: true, message: $t('sys.login.usernameNotice') }]">
              <a-input v-model="form.username" size="large" :placeholder="$t('sys.login.username')" allow-clear>
                <template #prefix><icon-user /></template>
              </a-input>
            </a-form-item>

            <a-form-item field="password" :hide-label="true" :rules="[{ required: true, message: $t('sys.login.passwordNotice') }]">
              <a-input-password v-model="form.password" :placeholder="$t('sys.login.password')" size="large" allow-clear>
                <template #prefix><icon-lock /></template>
              </a-input-password>
            </a-form-item>

            <!-- 拼图验证码 -->
            <a-form-item v-if="captchaType === 'puzzle'" :hide-label="true">
              <PuzzleCaptcha ref="puzzleRef" @ready="onPuzzleReady" @drag-end="onPuzzleDragEnd" />
            </a-form-item>

            <!-- 传统数字字母验证码 -->
            <a-form-item v-else field="code" :hide-label="true" :rules="[{ required: true, match: /^[a-zA-Z0-9]{4}$/, message: $t('sys.login.verifyCodeNotice') }]">
              <a-input v-model="form.code" :placeholder="$t('sys.login.verifyCode')" size="large" allow-clear>
                <template #prefix><icon-safe /></template>
                <template #append>
                  <img :src="captcha" class="captcha-img" @click="refreshCaptcha" alt="验证码" />
                </template>
              </a-input>
            </a-form-item>

            <a-form-item :hide-label="true" class="login-submit">
              <button type="submit" class="btn-primary login-btn" :disabled="loading">
                {{ loading ? $t('sys.login.logging') : $t('sys.login.loginBtn') }}
              </button>
            </a-form-item>
      </a-form>
    </div>

    <a-modal v-model:visible="showForcePw" :title="$t('setting.general.forceChangePw')" :footer="false" :closable="false" :mask-closable="false" simple>
      <p style="margin-bottom:12px;color:var(--color-on-surface-variant)">{{ $t('setting.general.forceChangePwDesc') }}</p>
      <div class="form-group">
        <label>{{ $t('setting.general.newPassword') }}</label>
        <a-input-password v-model="forcePwForm.new_password" size="large" />
      </div>
      <div class="form-group">
        <label>{{ $t('setting.general.confirmPassword') }}</label>
        <a-input-password v-model="forcePwForm.confirm_password" size="large" />
      </div>
      <button class="btn-primary" style="width:100%;padding:10px;margin-top:8px" @click="submitForcePassword" :disabled="forcePwLoading">
        {{ forcePwLoading ? $t('setting.btn_saving') : $t('setting.general.changePassword') }}
      </button>
    </a-modal>
  </div>
</template>

<style scoped>
.login-page {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  z-index: 3;
  overflow: hidden;
}

.login-card {
  width: 400px;
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-2xl) var(--spacing-xl);
  z-index: 10;
}

.login-brand {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-brand h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-on-surface);
  margin: 0;
  letter-spacing: -0.5px;
}

.version {
  font-size: 12px;
  color: var(--color-on-surface-variant);
  font-family: 'SF Mono', 'Cascadia Code', monospace;
}

.login-btn {
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-lg);
  font-size: 15px;
  font-weight: 600;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.captcha-img {
  height: 36px;
  cursor: pointer;
}

.login-submit {
  margin-top: var(--spacing-xl);
}

:deep(.arco-input-append) {
  padding: 0 !important;
}

:deep(.arco-input-wrapper) {
  border-color: var(--color-outline-variant);
  background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
}

:deep(.arco-input-wrapper:focus-within),
:deep(.arco-input-wrapper.arco-input-focus) {
  border-color: var(--color-primary);
}

:deep(.arco-input) {
  color: var(--color-on-surface);
}

:deep(.arco-input::placeholder) {
  color: var(--color-on-surface-variant);
}

@media (max-width: var(--breakpoint-md)) {
  .login-card {
    width: 90vw;
    max-width: 400px;
    padding: var(--spacing-xl) var(--spacing-lg);
  }
}
</style>
