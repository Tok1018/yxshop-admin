<template>
  <div class="license-page">
    <!-- 授权状态卡片 -->
    <el-card class="status-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>授权状态</span>
          <el-tag :type="statusTagType" size="large">{{ statusData.edition_name }}</el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="当前版本">
          <span class="edition-name">{{ statusData.edition_name }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="授权状态">
          <el-tag :type="statusData.is_valid ? 'success' : 'danger'" size="small">
            {{ statusData.is_valid ? '有效' : '无效' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="授权码">
          <code class="license-key">{{ statusData.license_key_masked || '未配置' }}</code>
        </el-descriptions-item>
        <el-descriptions-item label="绑定域名">
          {{ statusData.domain || '未绑定' }}
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">
          <span :class="{ 'expired': isExpired }">
            {{ statusData.expiry || '永久有效' }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="试用模式" v-if="statusData.is_trial">
          <el-tag :type="statusData.is_trial_expired ? 'danger' : 'warning'" size="small">
            {{ statusData.is_trial_expired ? '试用已过期' : `剩余 ${statusData.trial_remaining} 天` }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div class="action-bar">
        <el-button type="primary" @click="activateDialogVisible = true">激活授权码</el-button>
        <el-button type="warning" @click="trialDialogVisible = true" :disabled="statusData.is_trial && !statusData.is_trial_expired">
          申请试用
        </el-button>
        <el-button @click="refreshStatus">刷新状态</el-button>
      </div>
    </el-card>

    <!-- 功能对比表 -->
    <el-card class="compare-card" shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>功能版本对比</span>
        </div>
      </template>

      <el-table :data="compareData.features" border stripe>
        <el-table-column prop="name" label="功能模块" min-width="180" />
        <el-table-column label="开源版" width="100" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.open_source" color="#67C23A"><Check /></el-icon>
            <el-icon v-else color="#F56C6C"><Close /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="商业版" width="100" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.commercial" color="#67C23A"><Check /></el-icon>
            <el-icon v-else color="#F56C6C"><Close /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="企业版" width="100" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.enterprise" color="#67C23A"><Check /></el-icon>
            <el-icon v-else color="#F56C6C"><Close /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="当前状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.current ? 'success' : 'info'" size="small">
              {{ row.current ? '已启用' : '未启用' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="edition-pricing">
        <el-row :gutter="20">
          <el-col :span="8" v-for="(info, key) in compareData.editions" :key="key">
            <div class="edition-card" :class="{ 'current': key === compareData.current_edition }">
              <div class="edition-title">{{ info.name }}</div>
              <div class="edition-price">{{ info.price }}</div>
              <el-tag v-if="key === compareData.current_edition" type="success" size="small" style="margin-top: 8px">
                当前版本
              </el-tag>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 激活授权码对话框 -->
    <el-dialog v-model="activateDialogVisible" title="激活授权码" width="500px">
      <el-form :model="activateForm" label-width="100px">
        <el-form-item label="版本类型">
          <el-radio-group v-model="activateForm.edition">
            <el-radio value="commercial">商业版</el-radio>
            <el-radio value="enterprise">企业版</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="授权码">
          <el-input
            v-model="activateForm.license_key"
            type="textarea"
            :rows="3"
            placeholder="请输入授权码（格式：EDITION-DOMAIN_HASH-DATE-CHECKSUM）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="activateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleActivate" :loading="activating">激活</el-button>
      </template>
    </el-dialog>

    <!-- 申请试用对话框 -->
    <el-dialog v-model="trialDialogVisible" title="申请试用" width="450px">
      <el-alert
        title="试用说明"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        试用期为 14 天，试用期间可使用对应版本的全部功能。到期后系统将自动降级为开源版。
      </el-alert>
      <el-form :model="trialForm" label-width="100px">
        <el-form-item label="试用版本">
          <el-radio-group v-model="trialForm.edition">
            <el-radio value="commercial">商业版</el-radio>
            <el-radio value="enterprise">企业版</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="trialDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTrial" :loading="trialing">开始试用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close } from '@element-plus/icons-vue'

// API 请求基础函数
const request = (url, options = {}) => {
  const token = localStorage.getItem('token') || ''
  return fetch('/admin/api' + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).then(async (res) => {
    const data = await res.json()
    if (data.code !== 0 && data.code !== 200) {
      throw new Error(data.message || data.msg || '请求失败')
    }
    return data
  })
}

// 状态数据
const statusData = reactive({
  edition: 'open_source',
  edition_name: '开源版',
  is_valid: true,
  is_trial: false,
  is_trial_expired: false,
  trial_remaining: 0,
  expiry: null,
  domain: '',
  license_key_masked: '',
})

// 对比数据
const compareData = reactive({
  features: [],
  editions: {},
  current_edition: 'open_source',
})

// 对话框
const activateDialogVisible = ref(false)
const trialDialogVisible = ref(false)
const activating = ref(false)
const trialing = ref(false)

const activateForm = reactive({
  edition: 'commercial',
  license_key: '',
})

const trialForm = reactive({
  edition: 'commercial',
})

// 计算属性
const statusTagType = computed(() => {
  if (statusData.is_valid) {
    if (statusData.edition === 'open_source') return 'info'
    if (statusData.is_trial) return 'warning'
    return 'success'
  }
  return 'danger'
})

const isExpired = computed(() => {
  if (!statusData.expiry) return false
  return new Date(statusData.expiry) < new Date()
})

// 获取授权状态
const fetchStatus = async () => {
  try {
    const res = await request('/license/status')
    Object.assign(statusData, res.data)
  } catch (e) {
    ElMessage.error('获取授权状态失败: ' + e.message)
  }
}

// 获取功能对比
const fetchCompare = async () => {
  try {
    const res = await request('/license/compare')
    Object.assign(compareData, res.data)
  } catch (e) {
    ElMessage.error('获取功能对比失败: ' + e.message)
  }
}

// 刷新状态
const refreshStatus = () => {
  fetchStatus()
  fetchCompare()
}

// 激活授权码
const handleActivate = async () => {
  if (!activateForm.license_key.trim()) {
    ElMessage.warning('请输入授权码')
    return
  }

  activating.value = true
  try {
    const res = await request('/license/activate', {
      method: 'POST',
      body: {
        edition: activateForm.edition,
        license_key: activateForm.license_key.trim(),
      },
    })
    ElMessage.success(res.message || '授权码激活成功，请重启服务使配置生效')
    activateDialogVisible.value = false
    activateForm.license_key = ''
    refreshStatus()
  } catch (e) {
    ElMessage.error('激活失败: ' + e.message)
  } finally {
    activating.value = false
  }
}

// 申请试用
const handleTrial = async () => {
  trialing.value = true
  try {
    const res = await request('/license/trial', {
      method: 'POST',
      body: { edition: trialForm.edition },
    })
    ElMessage.success(res.message || '试用已启动，请重启服务使配置生效')
    trialDialogVisible.value = false
    refreshStatus()
  } catch (e) {
    ElMessage.error('试用申请失败: ' + e.message)
  } finally {
    trialing.value = false
  }
}

onMounted(() => {
  fetchStatus()
  fetchCompare()
})
</script>

<style scoped>
.license-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-card {
  max-width: 900px;
}

.action-bar {
  margin-top: 20px;
  display: flex;
  gap: 12px;
}

.edition-name {
  font-size: 16px;
  font-weight: bold;
}

.license-key {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #606266;
}

.expired {
  color: #F56C6C;
  font-weight: bold;
}

.edition-pricing {
  margin-top: 20px;
}

.edition-card {
  text-align: center;
  padding: 20px;
  border: 2px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
}

.edition-card.current {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.edition-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.edition-price {
  font-size: 24px;
  color: #F56C6C;
  font-weight: bold;
}
</style>
