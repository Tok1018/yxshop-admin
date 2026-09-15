<template>
  <div class="notification-center">
    <!-- 通知图标 -->
    <a-badge :count="unreadCount" :dot="unreadCount > 0">
      <a-button
        type="text"
        shape="circle"
        size="large"
        @click="showNotificationPanel = true"
      >
        <template #icon>
          <icon-notification />
        </template>
      </a-button>
    </a-badge>

    <!-- 通知面板 -->
    <a-drawer
      :visible="showNotificationPanel"
      title="通知中心"
      placement="right"
      width="400"
      @cancel="showNotificationPanel = false"
    >
      <div class="notification-panel">
        <!-- 通知类型筛选 -->
        <div class="notification-filter">
          <a-radio-group v-model="currentFilter" @change="filterNotifications">
            <a-radio value="all">全部</a-radio>
            <a-radio value="new_order">新订单</a-radio>
            <a-radio value="order_update">订单更新</a-radio>
            <a-radio value="payment">支付通知</a-radio>
          </a-radio-group>
        </div>

        <!-- 通知列表 -->
        <div class="notification-list">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :class="['notification-item', { unread: !notification.read }]"
            @click="markAsRead(notification)"
          >
            <div class="notification-icon">
              <icon-shopping-cart v-if="notification.type === 'new_order'" />
              <icon-sync v-else-if="notification.type === 'order_update'" />
              <icon-money v-else-if="notification.type === 'payment'" />
              <icon-notification v-else />
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.timestamp) }}</div>
            </div>
            <div class="notification-actions">
              <a-button
                type="text"
                size="small"
                @click.stop="deleteNotification(notification)"
              >
                <icon-delete />
              </a-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <icon-inbox />
          <p>暂无通知</p>
        </div>

        <!-- 操作按钮 -->
        <div class="notification-actions-bar">
          <a-button type="text" size="small" @click="markAllAsRead">
            全部已读
          </a-button>
          <a-button type="text" size="small" @click="clearAll">
            清空全部
          </a-button>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import websocketClient from '@/utils/websocket'

// 响应式数据
const showNotificationPanel = ref(false)
const currentFilter = ref('all')
const notifications = ref([])
const unreadCount = ref(0)

// 计算属性
const filteredNotifications = computed(() => {
  if (currentFilter.value === 'all') {
    return notifications.value
  }
  return notifications.value.filter(item => item.type === currentFilter.value)
})

// 方法
const addNotification = (notification) => {
  const newNotification = {
    id: Date.now() + Math.random(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    timestamp: Date.now(),
    read: false,
    data: notification.data
  }
  
  notifications.value.unshift(newNotification)
  unreadCount.value++
  
  // 限制通知数量
  if (notifications.value.length > 100) {
    notifications.value = notifications.value.slice(0, 100)
  }
}

const markAsRead = (notification) => {
  notification.read = true
  updateUnreadCount()
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  updateUnreadCount()
}

const deleteNotification = (notification) => {
  const index = notifications.value.findIndex(item => item.id === notification.id)
  if (index > -1) {
    notifications.value.splice(index, 1)
    if (!notification.read) {
      unreadCount.value--
    }
  }
}

const clearAll = () => {
  notifications.value = []
  unreadCount.value = 0
}

const filterNotifications = () => {
  // 筛选逻辑已在计算属性中处理
}

const updateUnreadCount = () => {
  unreadCount.value = notifications.value.filter(item => !item.read).length
}

const formatTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return new Date(timestamp).toLocaleDateString()
  }
}

// 注册WebSocket事件处理器
const setupWebSocketHandlers = () => {
  websocketClient.on('new_order', (data) => {
    addNotification({
      type: 'new_order',
      title: '新订单',
      message: `收到新订单：${data.order_no}`,
      data: data
    })
  })
  
  websocketClient.on('order_update', (data) => {
    addNotification({
      type: 'order_update',
      title: '订单状态更新',
      message: `订单 ${data.order_no} 状态变更为：${data.new_status_label}`,
      data: data
    })
  })
  
  websocketClient.on('payment_success', (data) => {
    addNotification({
      type: 'payment',
      title: '支付成功',
      message: `订单 ${data.order.order_no} 支付成功，金额：¥${data.amount}`,
      data: data
    })
  })
  
  websocketClient.on('order_cancel', (data) => {
    addNotification({
      type: 'order_update',
      title: '订单取消',
      message: `订单 ${data.order_no} 已取消`,
      data: data
    })
  })
}

// 生命周期
onMounted(() => {
  setupWebSocketHandlers()
})
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notification-filter {
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-1);
  margin-bottom: 16px;
}

.notification-list {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-bottom: 1px solid var(--color-fill-1);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--color-fill-2);
}

.notification-item.unread {
  background-color: rgba(var(--primary-1), 0.3);
}

.notification-item.unread:hover {
  background-color: rgba(var(--primary-1), 0.5);
}

.notification-icon {
  margin-right: 12px;
  margin-top: 2px;
  color: rgb(var(--primary-6));
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 4px;
  color: var(--color-text-1);
}

.notification-message {
  font-size: 14px;
  color: var(--color-text-2);
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: var(--color-text-4);
}

.notification-actions {
  margin-left: 8px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-text-4);
}

.empty-state .arco-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.notification-actions-bar {
  padding: 16px 0;
  border-top: 1px solid var(--color-border-1);
  display: flex;
  justify-content: space-between;
}
</style> 