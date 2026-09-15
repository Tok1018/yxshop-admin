<template>
  <div class="profile-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('profile.title') }}</h1>
        <p class="page-subtitle">{{ t('profile.subtitle') }}</p>
      </div>
    </div>

    <div class="profile-layout">
      <div class="profile-main">
        <div class="profile-card-section">
          <div class="avatar-section">
            <div class="avatar-upload" @click="triggerUpload">
              <img v-if="form.avatar" :src="form.avatar" class="avatar-img" />
              <div v-else class="avatar-placeholder">
                <icon-user :size="40" />
              </div>
              <div class="avatar-overlay">
                <icon-camera :size="20" />
              </div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" style="display: none" @change="handleFileChange" />
            <div class="avatar-info">
              <span class="avatar-name">{{ form.nickname || form.username }}</span>
              <span class="avatar-role">{{ roleDisplay }}</span>
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3>{{ t('profile.basicInfo') }}</h3>
          <div class="form-grid-profile">
            <div class="form-group">
              <label class="form-label">{{ t('profile.username') }}</label>
              <input v-model="form.username" class="form-input" disabled />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('profile.nickname') }} <span class="required">*</span></label>
              <input v-model="form.nickname" class="form-input" :placeholder="t('profile.nicknameRequired')" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('profile.phone') }}</label>
              <input v-model="form.phone" class="form-input" :placeholder="t('profile.phone')" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('profile.email') }}</label>
              <input v-model="form.email" class="form-input" :placeholder="t('profile.email')" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn-primary" :disabled="saving" @click="handleSaveProfile">
              <icon-check v-if="!saving" :size="16" />
              {{ saving ? t('profile.saving') : t('profile.save') }}
            </button>
          </div>
        </div>
      </div>

      <div class="profile-sidebar">
        <div class="info-card">
          <h3>{{ t('profile.changePassword') }}</h3>
          <div class="password-form">
            <div class="form-group">
              <label class="form-label">{{ t('profile.oldPassword') }}</label>
              <a-input-password v-model="passwordForm.old_password" :placeholder="t('profile.oldPasswordPlaceholder')" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('profile.newPassword') }}</label>
              <a-input-password v-model="passwordForm.new_password" :placeholder="t('profile.newPasswordPlaceholder')" />
            </div>
            <div class="form-group">
              <label class="form-label">{{ t('profile.confirmPassword') }}</label>
              <a-input-password v-model="passwordForm.confirm_password" :placeholder="t('profile.confirmPasswordPlaceholder')" />
            </div>
            <button class="btn-primary" :disabled="changingPassword" @click="handleChangePassword">
              <icon-lock v-if="!changingPassword" :size="16" />
              {{ changingPassword ? t('profile.submitting') : t('profile.submitPassword') }}
            </button>
          </div>
        </div>

        <div class="info-card">
          <h3>{{ t('profile.role') }}</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">{{ t('profile.role') }}</span>
              <span class="info-value">{{ roleDisplay }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('profile.lastLogin') }}</span>
              <span class="info-value">{{ formatTime(userInfo.last_login_at) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">{{ t('profile.createdAt') }}</span>
              <span class="info-value">{{ formatTime(userInfo.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { updateProfile, changePassword } from '@/api/profile'
import { request } from '@/utils/request'
import useUserStore from '@/store/modules/user'

const { t } = useI18n()
const userStore = useUserStore()

const saving = ref(false)
const changingPassword = ref(false)
const fileInput = ref(null)

const userInfo = computed(() => userStore.user || {})

const roleDisplay = computed(() => {
  if (userInfo.value.is_super_admin) return t('profile.superAdmin')
  const roles = userStore.roles || []
  if (roles.length > 0) return roles.map(r => r.name).join(', ')
  return t('profile.notSet')
})

const form = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  avatar: '',
})

const passwordForm = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

function loadFormData() {
  const u = userInfo.value
  form.username = u.username || ''
  form.nickname = u.nickname || ''
  form.phone = u.phone || ''
  form.email = u.email || ''
  form.avatar = u.avatar || ''
}

onMounted(() => {
  loadFormData()
})

function triggerUpload() {
  fileInput.value?.click()
}

async function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await request({
      url: '/admin/api/upload/image',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    if (res.code === 0 && res.data?.url) {
      form.avatar = res.data.url
    } else {
      Message.error(res.msg || 'Upload failed')
    }
  } catch {
    Message.error('Upload failed')
  }
  e.target.value = ''
}

async function handleSaveProfile() {
  if (!form.nickname?.trim()) {
    Message.warning(t('profile.nicknameRequired'))
    return
  }
  saving.value = true
  try {
    const res = await updateProfile({
      nickname: form.nickname,
      phone: form.phone,
      email: form.email,
      avatar: form.avatar,
    })
    if (res.code === 0) {
      Message.success(t('profile.saveSuccess'))
      await userStore.requestUserInfo()
      loadFormData()
    } else {
      Message.error(res.msg || t('profile.saveFailed'))
    }
  } catch {
    Message.error(t('profile.saveFailed'))
  } finally {
    saving.value = false
  }
}

async function handleChangePassword() {
  if (!passwordForm.old_password) {
    Message.warning(t('profile.oldPasswordPlaceholder'))
    return
  }
  if (!passwordForm.new_password || passwordForm.new_password.length < 6) {
    Message.warning(t('profile.passwordTooShort'))
    return
  }
  if (passwordForm.new_password !== passwordForm.confirm_password) {
    Message.warning(t('profile.passwordMismatch'))
    return
  }
  changingPassword.value = true
  try {
    const res = await changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password,
      confirm_password: passwordForm.confirm_password,
    })
    if (res.code === 0) {
      Message.success(t('profile.passwordSuccess'))
      passwordForm.old_password = ''
      passwordForm.new_password = ''
      passwordForm.confirm_password = ''
    } else {
      Message.error(res.msg || t('profile.passwordFailed'))
    }
  } catch {
    Message.error(t('profile.passwordFailed'))
  } finally {
    changingPassword.value = false
  }
}

function formatTime(ts) {
  if (!ts) return t('profile.notSet')
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  if (isNaN(d.getTime())) return t('profile.notSet')
  return d.toLocaleString()
}
</script>

<style>
.profile-page {
  padding: var(--spacing-xl);

}

.profile-page .page-subtitle {
  font-size: 14px;

}

.profile-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

@media (min-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr 380px;
  }
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.profile-card-section {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(var(--color-outline-variant-rgb), 0.3);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.avatar-upload {
  position: relative;
  width: 88px;
  height: 88px;
  border-radius: var(--radius-full);
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
  background: var(--color-surface-container);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-upload:hover .avatar-overlay {
  opacity: 1;
}

.avatar-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.avatar-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-on-surface);
}

.avatar-role {
  font-size: 13px;
  color: var(--color-on-surface-variant);
}

.form-grid-profile {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-base) var(--spacing-xl);
}

.form-group {
  margin-bottom: 0;
}

.form-label {
  margin-bottom: 0;
}

.form-input {
  background: var(--color-surface-container-low);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-base);
  border-top: 1px solid rgba(var(--color-outline-variant-rgb), 0.2);
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.password-form .btn-primary {
  align-self: flex-end;
  margin-top: var(--spacing-sm);
}

html.dark .profile-card-section,
[arco-theme="dark"] .profile-card-section {
  border-color: rgba(var(--color-outline-variant-rgb), 0.3);
}

html.dark .avatar-placeholder,
[arco-theme="dark"] .avatar-placeholder {
  background: var(--color-surface-container-high);
}

</style>