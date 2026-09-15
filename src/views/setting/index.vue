<template>
  <div class="setting-page">
    <div class="page-content">
      <div class="tab-nav">
        <button v-for="tab in tabs" :key="tab.key" :class="['tab-item', { active: activeTab === tab.key }]" @click="activeTab = tab.key">{{ tab.label }}</button>
      </div>

      <div v-if="activeTab === 'general'" class="tab-content">
        <div class="general-grid">
          <div class="card-shadow notif-card">
            <div class="card-header-row">
              <h3 class="headline-md">{{ t('setting.general.notifTitle') }}</h3>
              <icon-settings class="text-on-surface-variant" />
            </div>
            <div class="toggle-list">
              <div v-for="item in notifToggles" :key="item.key" class="toggle-item">
                <div>
                  <p class="body-lg font-bold">{{ item.title }}</p>
                  <p class="body-md text-on-surface-variant">{{ item.desc }}</p>
                </div>
                <a-switch v-model="notifForm[item.key]" :checked-value="1" :unchecked-value="0" />
              </div>
            </div>
          </div>

          <div class="card-shadow login-settings-card">
            <div class="card-header-row">
              <h3 class="headline-md">{{ t('setting.security.session_title') }}</h3>
              <icon-settings class="text-on-surface-variant" />
            </div>
            <div class="form-list">
              <div class="form-group">
                <label class="form-label">{{ t('setting.security.session_timeout') }}</label>
                <a-input-number v-model="loginForm.session_timeout" :min="15" :max="1440" />
                <p class="form-tip">{{ t('setting.security.unit_min') }}</p>
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('setting.security.captcha_type') }}</label>
                <a-radio-group v-model="loginForm.captcha_type" direction="vertical">
                  <a-radio value="text">{{ t('setting.security.captcha_type_text') }}</a-radio>
                  <a-radio value="puzzle">{{ t('setting.security.captcha_type_puzzle') }}</a-radio>
                </a-radio-group>
                <p class="form-tip">{{ t('setting.security.captcha_type_tip') }}</p>
              </div>
            </div>
            <button class="btn-primary" @click="saveLoginSettings" :disabled="loginSaving">{{ loginSaving ? t('setting.btn_saving') : t('setting.btn_save') }}</button>
          </div>

          <div class="card-shadow regional-card">
            <div class="regional-header">
              <div>
                <h3 class="headline-md">{{ t('setting.general.regionalTitle') }}</h3>
                <p class="body-md text-on-surface-variant">{{ t('setting.general.regionalDesc') }}</p>
              </div>
            </div>
            <div class="regional-tags">
              <div class="regional-tag">
                <span class="label-sm text-on-surface-variant">{{ t('setting.general.language') }}:</span>
                <span class="label-sm font-bold">{{ regionalForm.language }}</span>
              </div>
              <div class="regional-tag">
                <span class="label-sm text-on-surface-variant">{{ t('setting.general.currency') }}:</span>
                <span class="label-sm font-bold">{{ regionalForm.currency }}</span>
              </div>
              <div class="regional-tag">
                <span class="label-sm text-on-surface-variant">{{ t('setting.general.timezone') }}:</span>
                <span class="label-sm font-bold">{{ regionalForm.timezone }}</span>
              </div>
            </div>
            <button class="btn-ghost btn-full" style="margin-top:var(--spacing-base)" @click="saveRegional">{{ t('setting.btn_save') }}</button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'team'" class="tab-content">
        <div class="card-shadow team-card">
          <div class="team-header">
            <div>
              <h3 class="headline-md">{{ t('setting.team.title') }}</h3>
              <p class="body-md text-on-surface-variant">{{ t('setting.team.desc') }}</p>
            </div>
            <button class="btn-primary" @click="inviteMember"><icon-user-add /> {{ t('setting.team.invite') }}</button>
          </div>
          <div class="table-scroll custom-scrollbar">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('setting.team.user') }}</th>
                  <th>{{ t('setting.team.role') }}</th>
                  <th>{{ t('setting.team.status') }}</th>
                  <th>{{ t('setting.team.lastActive') }}</th>
                  <th class="col-actions">{{ t('setting.team.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in teamMembers" :key="member.id">
                  <td>
                    <div class="member-cell">
                      <div class="member-avatar" :class="member.avatarClass">{{ member.initials }}</div>
                      <div>
                        <span class="body-md font-bold">{{ member.name }}</span>
                        <span class="label-sm text-on-surface-variant">{{ member.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select v-if="!member.is_super_admin" v-model="member.role_id" class="role-select" @change="updateRole(member)">
                      <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.role_name }}</option>
                    </select>
                    <span v-else class="super-admin-badge">{{ t('setting.team.superAdmin') }}</span>
                  </td>
                  <td>
                    <span :class="['status-badge', member.status === 'active' ? 'status-on' : (member.status === 'disabled' ? 'status-off' : 'status-pending')]">
                      <span class="status-dot"></span>
                      {{ member.status === 'active' ? t('setting.team.active') : (member.status === 'disabled' ? t('setting.team.disable') : t('setting.team.pending')) }}
                    </span>
                  </td>
                  <td><span class="body-md text-on-surface-variant">{{ member.lastActive }}</span></td>
                  <td class="actions-cell" @click.stop>
                    <button v-if="!member.is_super_admin && member.id !== userStore.user?.id" class="btn-ghost btn-sm" @click="toggleMemberStatus(member)">
                      {{ member.status === 'active' ? t('setting.team.disable') : t('setting.team.enable') }}
                    </button>
                    <button v-if="!member.is_super_admin && member.id !== userStore.user?.id" class="btn-danger btn-sm" @click="removeMember(member)">
                      {{ t('setting.team.remove') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'basic'" class="tab-content">
        <div class="card-shadow form-card">
          <h3 class="headline-md">{{ t('setting.section_basic') }}</h3>
          <div class="form-list">
            <div class="form-group"><label class="form-label">{{ t('setting.label_site_name') }}</label><input v-model="basicForm.site_name" class="form-input" /></div>
            <div class="form-group"><label class="form-label">{{ t('setting.label_site_description') }}</label><textarea v-model="basicForm.site_description" class="form-input" rows="3"></textarea></div>
            <div class="form-group"><label class="form-label">{{ t('setting.label_service_phone') }}</label><input v-model="basicForm.service_phone" class="form-input" /></div>
          </div>
          <button class="btn-primary" @click="saveBasic">{{ t('setting.btn_save') }}</button>
        </div>
      </div>

      <div v-if="activeTab === 'trade'" class="tab-content">
        <div class="card-shadow form-card">
          <h3 class="headline-md">{{ t('setting.section_trade') }}</h3>
          <div class="form-list">
            <div class="form-group"><label class="form-label">{{ t('setting.label_order_auto_cancel_minutes') }}</label><input v-model.number="tradeForm.order_auto_cancel_minutes" type="number" class="form-input" /></div>
            <div class="form-group"><label class="form-label">{{ t('setting.label_auto_confirm_days') }}</label><input v-model.number="tradeForm.auto_confirm_days" type="number" class="form-input" /></div>
            <div class="form-group"><label class="form-label">{{ t('setting.label_auto_review_days') }}</label><input v-model.number="tradeForm.auto_review_days" type="number" class="form-input" /></div>
            <div class="form-group"><label class="form-label">{{ t('setting.label_return_apply_days') }}</label><input v-model.number="tradeForm.return_apply_days" type="number" class="form-input" /></div>
            <div class="form-group toggle-form-row"><label class="form-label">{{ t('setting.label_invoice_enable') }}</label><a-switch v-model="tradeForm.invoice_enable" :checked-value="1" :unchecked-value="0" /></div>
            <div class="form-group"><label class="form-label">{{ t('setting.label_order_amount_decimals') }}</label><input v-model.number="tradeForm.order_amount_decimals" type="number" min="0" max="4" class="form-input" /></div>
          </div>
          <button class="btn-primary" @click="saveTrade">{{ t('setting.btn_save') }}</button>
        </div>
      </div>

      <div v-if="activeTab === 'payment'" class="tab-content">
        <div class="card-shadow form-card">
          <h3 class="headline-md">{{ t('setting.section_wechat_pay') }}</h3>
          <div class="form-list">
            <div class="form-group toggle-form-row"><label class="form-label">{{ t('setting.label_wxpay_enable') }}</label><a-switch v-model="paymentForm.wxpay_enable" :checked-value="1" :unchecked-value="0" /></div>
            <template v-if="paymentForm.wxpay_enable">
              <div class="form-group"><label class="form-label">{{ t('setting.label_wxpay_appid') }}</label><input v-model="paymentForm.wxpay_appid" class="form-input" /></div>
              <div class="form-group"><label class="form-label">{{ t('setting.label_wechat_mch_id') }}</label><input v-model="paymentForm.wxpay_mchid" class="form-input" /></div>
              <div class="form-group"><label class="form-label">{{ t('setting.label_wxpay_key') }}</label><input v-model="paymentForm.wxpay_key" :type="paymentFieldVisible.wxpay_key ? 'text' : 'password'" class="form-input" @focus="paymentFieldVisible.wxpay_key = true" @blur="paymentFieldVisible.wxpay_key = false" :placeholder="paymentForm.wxpay_key ? t('setting.encrypted_mask') : ''" /></div>
              <div class="form-group"><label class="form-label">{{ t('setting.label_wxpay_notify') }}</label><input v-model="paymentForm.wxpay_notify" class="form-input" /></div>
              <div class="form-group"><label class="form-label">{{ t('setting.label_wxpay_refund_notify') }}</label><input v-model="paymentForm.wxpay_refund_notify" class="form-input" /></div>
              <div class="form-group"><label class="form-label">{{ t('setting.label_wxpay_v3_key') }}</label><input v-model="paymentForm.wxpay_v3_key" :type="paymentFieldVisible.wxpay_v3_key ? 'text' : 'password'" class="form-input" @focus="paymentFieldVisible.wxpay_v3_key = true" @blur="paymentFieldVisible.wxpay_v3_key = false" :placeholder="paymentForm.wxpay_v3_key ? t('setting.encrypted_mask') : ''" /></div>
              <div class="form-group"><label class="form-label">{{ t('setting.label_wxpay_serial_no') }}</label><input v-model="paymentForm.wxpay_serial_no" class="form-input" /></div>
              <div class="form-group">
                <label class="form-label">{{ t('setting.label_wxpay_cert') }}</label>
                <div class="cert-area">
                  <span v-if="paymentForm.wxpay_cert_uploaded" class="cert-status cert-uploaded">{{ t('setting.cert_uploaded') }}</span>
                  <span v-else class="cert-status cert-not-uploaded">{{ t('setting.cert_not_uploaded') }}</span>
                  <input type="file" accept=".pem" ref="certFileInput" style="display:none" @change="onCertUpload" />
                  <button class="btn-secondary btn-sm" @click="$refs.certFileInput.click()">{{ t('setting.btn_upload_cert') }}</button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('setting.label_wxpay_platform_cert') }}</label>
                <div class="cert-area">
                  <span v-if="paymentForm.wxpay_platform_cert_uploaded" class="cert-status cert-uploaded">{{ t('setting.cert_uploaded') }}</span>
                  <span v-else class="cert-status cert-not-uploaded">{{ t('setting.cert_not_uploaded') }}</span>
                  <input type="file" accept=".pem" ref="platformCertInput" style="display:none" @change="onPlatformCertUpload" />
                  <button class="btn-secondary btn-sm" @click="$refs.platformCertInput.click()">{{ t('setting.btn_upload_cert') }}</button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">{{ t('setting.label_connection_test') }}</label>
                <button class="btn-secondary btn-sm" :disabled="testLoading" @click="onTestConnection">{{ testLoading ? t('setting.testing') : t('setting.btn_test_connection') }}</button>
                <span v-if="testResult !== null" :class="testResult.success ? 'test-success' : 'test-fail'">{{ testResult.message }}</span>
              </div>
            </template>
          </div>
        </div>
        <button class="btn-primary" style="margin-top:16px" @click="savePayment">{{ t('setting.btn_save') }}</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import {
  IconSettings, IconUserAdd
} from '@arco-design/web-vue/es/icon'
import * as settingApi from '@/api/setting'
import { getRoleList } from '@/api/role'
import useUserStore from '@/store/modules/user'

const { t } = useI18n()
const userStore = useUserStore()

const activeTab = ref('general')
const tabs = computed(() => [
  { key: 'general', label: t('setting.tab_general') },
  { key: 'team', label: t('setting.tab_team') },
  { key: 'basic', label: t('setting.tab_basic') },
  { key: 'trade', label: t('setting.tab_trade') },
  { key: 'payment', label: t('setting.tab_payment') },
])

const notifForm = reactive({ push_notifications: 1, email_digests: 0, inventory_alerts: 1 })

const loginForm = reactive({ session_timeout: 120, captcha_type: 'text' })
const loginSaving = ref(false)

const loadLoginSettings = async () => {
  try {
    const res = await settingApi.getSecuritySettings()
    const d = res.data || {}
    if (d.session_timeout !== undefined) loginForm.session_timeout = Number(d.session_timeout)
    if (d.captcha_type !== undefined) loginForm.captcha_type = d.captcha_type
  } catch (e) {}
}

const saveLoginSettings = async () => {
  loginSaving.value = true
  try {
    await settingApi.saveSecuritySettings(loginForm)
    Message.success(t('setting.save_success'))
  } catch (error) {
    Message.error(error?.response?.data?.msg || t('setting.save_failed'))
  } finally {
    loginSaving.value = false
  }
}

const notifToggles = computed(() => [
  { key: 'push_notifications', title: t('setting.general.pushNotif'), desc: t('setting.general.pushNotifDesc') },
  { key: 'email_digests', title: t('setting.general.emailDigest'), desc: t('setting.general.emailDigestDesc') },
  { key: 'inventory_alerts', title: t('setting.general.inventoryAlert'), desc: t('setting.general.inventoryAlertDesc') },
])

const teamMembers = ref([])
const roles = ref([])

const basicForm = reactive({ site_name: '', site_description: '', service_phone: '' })
const tradeForm = reactive({ order_auto_cancel_minutes: 30, auto_confirm_days: 7, auto_review_days: 15, return_apply_days: 7, invoice_enable: 0, order_amount_decimals: 2 })
const paymentForm = reactive({ wxpay_enable: 0, wxpay_appid: '', wxpay_mchid: '', wxpay_key: '', wxpay_notify: '', wxpay_refund_notify: '', wxpay_v3_key: '', wxpay_serial_no: '', wxpay_cert_uploaded: false, wxpay_key_uploaded: false, wxpay_platform_cert_uploaded: false })
const paymentFieldVisible = reactive({ wxpay_key: false, wxpay_v3_key: false })
const testLoading = ref(false)
const testResult = ref(null)

const regionalForm = reactive({ language: 'zh-CN', currency: 'CNY', timezone: 'Asia/Shanghai' })

const inviteMember = async () => {
  const email = prompt(t('setting.team.invite') + ' Email:')
  if (!email) return
  try {
    await settingApi.inviteTeamMember({ email })
    Message.success(t('setting.save_success'))
    loadTeamMembers()
  } catch (error) { Message.error(t('setting.save_failed')) }
}
const updateRole = async (m) => {
  try {
    await settingApi.updateTeamRole(m.id, { role_id: m.role_id })
    Message.success(t('setting.team.roleUpdated'))
  } catch (error) { Message.error(t('setting.save_failed')) }
}
const toggleMemberStatus = async (m) => {
  const newStatus = m.status === 'active' ? 'disabled' : 'active'
  const msgKey = newStatus === 'active' ? 'confirmEnable' : 'confirmDisable'
  if (!confirm(t(`setting.team.${msgKey}`))) return
  try {
    await settingApi.updateTeamMemberStatus(m.id, { status: newStatus })
    m.status = newStatus
    m.avatarClass = newStatus === 'active' ? 'avatar-secondary' : 'avatar-muted'
    Message.success(newStatus === 'active' ? t('setting.team.memberEnabled') : t('setting.team.memberDisabled'))
  } catch (error) { Message.error(error?.response?.data?.message || t('setting.save_failed')) }
}
const removeMember = async (m) => {
  if (!confirm(t('setting.team.confirmRemove'))) return
  try {
    await settingApi.removeTeamMember(m.id)
    Message.success(t('setting.team.memberRemoved'))
    loadTeamMembers()
  } catch (error) { Message.error(error?.response?.data?.message || t('setting.save_failed')) }
}
const loadTeamMembers = async () => {
  try {
    const [teamRes, roleRes] = await Promise.all([
      settingApi.getTeamMembers(),
      getRoleList(),
    ])
    const teamData = teamRes.data?.data || teamRes.data || []
    if (Array.isArray(teamData)) {
      teamMembers.value = teamData.map(m => ({
        ...m,
        initials: (m.name || '').slice(0, 2).toUpperCase(),
        lastActive: m.last_active || t('setting.team.never'),
        avatarClass: m.status === 'active' ? 'avatar-secondary' : 'avatar-muted',
      }))
    }
    const roleData = roleRes.data?.data || roleRes.data || []
    if (Array.isArray(roleData)) {
      roles.value = roleData
    }
  } catch (error) { /* ignore */ }
}
const loadRegionalSettings = async () => {
  try {
    const res = await settingApi.getRegionalSettings()
    if (res.data) Object.assign(regionalForm, res.data)
  } catch (error) { /* ignore */ }
}
const saveRegional = async () => {
  try {
    await settingApi.updateRegionalSettings(regionalForm)
    Message.success(t('setting.save_success'))
  } catch (error) { Message.error(t('setting.save_failed')) }
}

const saveBasic = async () => {
  try { await settingApi.saveSetting(basicForm); Message.success(t('setting.save_success')) } catch (error) { Message.error(t('setting.save_failed')) }
}
const saveTrade = async () => {
  try { await settingApi.saveTradeSettings(tradeForm); Message.success(t('setting.save_success')) } catch (error) { Message.error(t('setting.save_failed')) }
}
const savePayment = async () => {
  try { await settingApi.savePayment(paymentForm); Message.success(t('setting.save_success')) } catch (error) { Message.error(t('setting.save_failed')) }
}

const onCertUpload = async (e) => {
  const files = e.target.files
  if (!files || files.length < 2) {
    Message.warning(t('setting.cert_select_both'))
    return
  }
  const formData = new FormData()
  formData.append('cert_file', files[0])
  formData.append('key_file', files[1])
  try {
    const res = await settingApi.uploadCert(formData)
    paymentForm.wxpay_cert_uploaded = true
    paymentForm.wxpay_key_uploaded = true
    if (res.data?.platform_cert_uploaded) paymentForm.wxpay_platform_cert_uploaded = true
    Message.success(t('setting.cert_upload_success'))
  } catch (error) { Message.error(t('setting.cert_upload_failed')) }
}

const onPlatformCertUpload = async (e) => {
  const files = e.target.files
  if (!files || files.length < 1) return
  const formData = new FormData()

  formData.append('platform_cert_file', files[0])
  try {
    await settingApi.uploadCert(formData)
    paymentForm.wxpay_platform_cert_uploaded = true
    Message.success(t('setting.cert_upload_success'))
  } catch (error) { Message.error(t('setting.cert_upload_failed')) }
}

const onTestConnection = async () => {
  testLoading.value = true
  testResult.value = null
  try {
    const res = await settingApi.testPayment()
    testResult.value = { success: true, message: res.message || t('setting.connection_success') }
  } catch (error) {
    testResult.value = { success: false, message: error.response?.data?.message || t('setting.connection_failed') }
  } finally {
    testLoading.value = false
  }
}

onMounted(async () => {
  loadLoginSettings()
  try {
    const [basicRes, payRes, tradeRes] = await Promise.all([
      settingApi.getSetting(), settingApi.getPayment(), settingApi.getTradeSettings(),
    ])
    if (basicRes.data) Object.assign(basicForm, basicRes.data)
    if (payRes.data) Object.assign(paymentForm, payRes.data)
    if (tradeRes.data) Object.assign(tradeForm, tradeRes.data)
  } catch (error) { Message.error(t('setting.save_failed')) }

  loadTeamMembers()
  loadRegionalSettings()
})
</script>

<style scoped>
.setting-page {
  padding: var(--spacing-xl);
  color: var(--color-on-surface);
  font-family: var(--font-body-md);
}


.text-on-surface-variant { color: var(--color-on-surface-variant); }
.font-bold { font-weight: 700; }
.body-md { font-size: 14px; line-height: 20px; }
.body-lg { font-size: 16px; line-height: 24px; }
.label-sm { font-size: 12px; line-height: 16px; letter-spacing: 0.01em; font-weight: 500; }
.headline-md { font-size: 20px; line-height: 28px; font-weight: 600; }

.tab-nav {
  display: flex;
  gap: var(--spacing-2xl);
  border-bottom: 1px solid var(--color-outline-variant);
  margin-bottom: var(--spacing-2xl);
  overflow-x: auto;
}
.tab-item {
  padding-bottom: var(--spacing-base);
  font-size: 20px; font-weight: 600;
  color: var(--color-on-surface-variant);
  border-bottom: 2px solid transparent;
  background: none; border-top: none; border-left: none; border-right: none;
  cursor: pointer; white-space: nowrap; transition: all 0.2s;
}
.tab-item:hover { color: var(--color-on-surface); }
.tab-item.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }

.tab-content { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.general-grid {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: var(--spacing-lg);
}

.notif-card,
.login-settings-card,
.regional-card,
.team-card,
.form-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
}

.card-header-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: var(--spacing-xl);
}

.toggle-list { display: flex; flex-direction: column; gap: var(--spacing-xl); }
.toggle-item {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid rgba(var(--color-outline-variant-rgb), 0.2);
}
.toggle-item:last-child { border-bottom: none; padding-bottom: 0; }

.regional-card { grid-column: 1 / -1; }
.regional-header { margin-bottom: var(--spacing-xl); }
.regional-tags { display: flex; flex-wrap: wrap; gap: var(--spacing-base); }
.regional-tag {
  background: var(--color-surface-container-low);
  padding: var(--spacing-sm) var(--spacing-base);
  border-radius: var(--radius-md);
  display: flex; align-items: center; gap: var(--spacing-sm);
}

.team-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: var(--spacing-xl); gap: var(--spacing-base); flex-wrap: wrap;
}


.team-card .data-table thead th {
  padding: var(--spacing-base) var(--spacing-xl);
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--color-on-surface-variant);
  background: rgba(var(--color-surface-container-low-rgb, 242, 244, 246), 0.5);
}
.team-card .data-table tbody td {
  padding: var(--spacing-base) var(--spacing-xl);
  font-size: 14px; color: var(--color-on-surface);
  border-bottom: 1px solid rgba(var(--color-outline-variant-rgb), 0.3);
}
.team-card .data-table tbody tr:hover {
  background: rgba(var(--color-surface-container-low-rgb, 242, 244, 246), 0.5);
}

.member-cell { display: flex; align-items: center; gap: var(--spacing-base); }
.member-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0;
}
.avatar-secondary { background: rgba(var(--color-secondary-rgb), 0.1); color: var(--color-secondary); }
.avatar-tertiary { background: rgba(var(--color-tertiary-rgb), 0.1); color: var(--color-tertiary); }
.avatar-muted { background: rgba(var(--color-outline-variant-rgb), 0.3); color: var(--color-on-surface-variant); }

.role-select {
  background: var(--color-surface-container);
  padding: 4px var(--spacing-base);
  border-radius: var(--radius-full);
  font-size: 12px; font-weight: 500; color: var(--color-on-surface);
  border: none; outline: none; cursor: pointer; font-family: inherit;
}

.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: var(--radius-full);
  font-size: 11px; font-weight: 700;
}

.status-on { background: rgba(var(--color-primary-container-rgb), 0.1); color: var(--color-primary); }
.status-on .status-dot { background: var(--color-primary-container); }
.status-off { background: var(--color-surface-container-high); color: var(--color-on-surface-variant); }
.status-off .status-dot { background: var(--color-outline); }
.status-pending { background: rgba(var(--color-tertiary-rgb), 0.1); color: var(--color-tertiary); }
.status-pending .status-dot { background: var(--color-tertiary); }

.super-admin-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px; font-weight: 600;
  background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary);
}

.btn-danger {
  background: rgba(255, 77, 79, 0.08); color: #ff4d4f;
  border: 1px solid rgba(255, 77, 79, 0.2);
  border-radius: var(--radius-md);
  cursor: pointer; font-family: inherit;
  transition: all 0.2s;
}
.btn-danger:hover { background: rgba(255, 77, 79, 0.15); }


.btn-full { width: 100%; justify-content: center; }

.form-card { max-width: 100%; }
.form-list { display: flex; flex-direction: column; gap: var(--spacing-xl); margin-bottom: var(--spacing-xl); }
.form-group { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.form-label { font-size: 14px; font-weight: 500; color: var(--color-on-surface-variant); }
.form-input { background: var(--color-surface-container-low); padding: 10px var(--spacing-base); }
.form-tip { font-size: 12px; color: var(--color-on-surface-variant); margin: 0; line-height: 1.6; }

.cert-area { display: flex; align-items: center; gap: 12px; }
.cert-status { font-size: 13px; }
.cert-uploaded { color: var(--color-primary-fixed); }
.cert-not-uploaded { color: var(--color-tertiary-fixed); }
.btn-sm { padding: 6px 16px; font-size: 13px; }
.test-success { color: #52c41a; margin-left: 12px; font-size: 13px; }
.test-fail { color: #ff4d4f; margin-left: 12px; font-size: 13px; }

.toggle-form-row {
  flex-direction: row; justify-content: space-between; align-items: center;
}

@media (max-width: var(--breakpoint-lg)) {
  .general-grid { grid-template-columns: 1fr; }
}

@media (max-width: var(--breakpoint-md)) {
  .setting-page { padding: var(--spacing-base); }
  .tab-nav { gap: var(--spacing-xl); }
  .tab-item { font-size: 16px; }
}
</style>
