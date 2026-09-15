<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('mini_page.tabbar_title') }}</h1>
        <p class="page-subtitle">{{ t('mini_page.tabbar_subtitle') }}</p>
      </div>
      <div class="page-actions">
        <button class="btn-primary" :disabled="saving" @click="handleSave">{{ t('mini_page.btn_save') }}</button>
      </div>
    </div>

    <div class="tabbar-layout">
      <div class="tabbar-form-area">
        <div class="form-section">
          <h4>{{ t('mini_page.tabbar_style') }}</h4>
          <div class="form-row">
            <div class="form-group">
              <label>{{ t('mini_page.tabbar_color') }}</label>
              <div class="color-input-row">
                <input type="color" v-model="form.color" class="color-picker" />
                <input v-model="form.color" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('mini_page.tabbar_selected_color') }}</label>
              <div class="color-input-row">
                <input type="color" v-model="form.selected_color" class="color-picker" />
                <input v-model="form.selected_color" class="form-input" />
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>{{ t('mini_page.tabbar_bg_color') }}</label>
              <div class="color-input-row">
                <input type="color" v-model="form.background_color" class="color-picker" />
                <input v-model="form.background_color" class="form-input" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('mini_page.tabbar_border_style') }}</label>
              <select v-model="form.border_style" class="form-input">
                <option value="black">{{ t('mini_page.border_black') }}</option>
                <option value="white">{{ t('mini_page.border_white') }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-section">
          <div class="section-header">
            <h4>{{ t('mini_page.tabbar_items') }}（{{ form.items.length }}/5）</h4>
            <button v-if="form.items.length < 5" class="btn-ghost btn-sm" @click="addItem">+ {{ t('mini_page.btn_add_tab') }}</button>
          </div>
          <div v-for="(item, index) in form.items" :key="index" class="tabbar-item-form">
            <div class="item-header">
              <span>{{ t('mini_page.tab_item') }} {{ index + 1 }}</span>
              <button v-if="form.items.length > 2" class="btn-danger btn-sm" @click="removeItem(index)">{{ t('mini_page.btn_remove') }}</button>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('mini_page.tab_text') }} <span class="required">*</span></label>
                <input v-model="item.text" class="form-input" :placeholder="t('mini_page.tab_text_placeholder')" />
              </div>
              <div class="form-group">
                <label>{{ t('mini_page.tab_page_path') }} <span class="required">*</span></label>
                <select v-model="item.page_path" class="form-input">
                  <option value="">请选择页面</option>
                  <option value="/pages/home/home">首页</option>
                  <option value="/pages/category/category">分类</option>
                  <option value="/pages/cart/cart">购物车</option>
                  <option value="/pages/favorite/favorite">收藏</option>
                  <option value="/pages/profile/profile">我的</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('mini_page.tab_icon_path') }}<span class="muted">（留空使用内置图标）</span></label>
                <div class="icon-field">
                  <input v-model="item.icon_path" class="form-input" placeholder="留空使用内置矢量图标" />
                  <sa-upload-image v-model="item.icon_path" />
                </div>
              </div>
              <div class="form-group">
                <label>{{ t('mini_page.tab_selected_icon_path') }}<span class="muted">（留空使用内置图标）</span></label>
                <div class="icon-field">
                  <input v-model="item.selected_icon_path" class="form-input" placeholder="留空使用内置矢量图标" />
                  <sa-upload-image v-model="item.selected_icon_path" />
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>{{ t('mini_page.tab_require_login') }}</label>
              <div class="switch-row">
                <input type="checkbox" v-model="item.require_login" class="toggle-checkbox" />
                <span class="muted">{{ item.require_login ? t('common.yes') : t('common.no') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预览区 — 对照设计稿 -->
      <div class="tabbar-preview-area">
        <div class="preview-label">{{ t('mini_page.preview') }}</div>
        <div class="preview-phone">
          <div class="preview-content">
            <div class="preview-placeholder">
              <icon-apps :size="32" />
              <span>{{ t('mini_page.canvas_empty') }}</span>
            </div>
          </div>
          <div class="preview-tabbar" :style="{ background: form.background_color }">
            <div class="preview-tabbar-border" :style="{ background: form.border_style === 'black' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.3)' }"></div>
            <div class="preview-tabbar-inner">
              <div
                v-for="(item, index) in form.items"
                :key="index"
                class="preview-tab-item"
                :class="{ 'preview-cart': item.page_path === '/pages/cart/cart' }"
                @click="activeTab = index"
              >
                <!-- 购物车凸起样式 -->
                <div v-if="item.page_path === '/pages/cart/cart'" class="preview-cart-icon-wrap">
                  <img v-if="item.icon_path" :src="item.icon_path" class="preview-icon-img" />
                  <MpIcon v-else name="shopping-cart" :size="20" color="#fff" />
                </div>
                <!-- 普通图标 -->
                <div v-else class="preview-tab-icon">
                  <img v-if="item.icon_path" :src="item.icon_path" class="preview-icon-img" />
                  <MpIcon
                    v-else
                    :name="pathIconMap[item.page_path] || 'home'"
                    :size="22"
                    :color="index === activeTab ? form.selected_color : form.color"
                  />
                </div>
                <span class="preview-tab-text" :style="{ color: index === activeTab ? form.selected_color : form.color }">{{ item.text || t('mini_page.tab_text_placeholder') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { IconApps } from '@arco-design/web-vue/es/icon'
import { getMiniTabBar, saveMiniTabBar } from '@/api/mini-page'
import MpIcon from '@/components/MpIcon.vue'

const { t } = useI18n()

const saving = ref(false)
const activeTab = ref(0)

/** page_path → 内置图标名映射（与小程序端一致） */
const pathIconMap = {
  '/pages/home/home': 'home',
  '/pages/category/category': 'grid',
  '/pages/cart/cart': 'shopping-cart',
  '/pages/favorite/favorite': 'star',
  '/pages/profile/profile': 'user-circle',
}

const form = reactive({
  color: '#94a3b8',
  selected_color: '#2563eb',
  background_color: '#FFFFFF',
  border_style: 'white',
  items: [
    { text: '首页', icon_path: '', selected_icon_path: '', page_path: '/pages/home/home', require_login: false },
    { text: '分类', icon_path: '', selected_icon_path: '', page_path: '/pages/category/category', require_login: false },
    { text: '购物车', icon_path: '', selected_icon_path: '', page_path: '/pages/cart/cart', require_login: true },
    { text: '收藏', icon_path: '', selected_icon_path: '', page_path: '/pages/favorite/favorite', require_login: false },
    { text: '我的', icon_path: '', selected_icon_path: '', page_path: '/pages/profile/profile', require_login: false },
  ]
})

const addItem = () => {
  if (form.items.length >= 5) return
  form.items.push({ text: '', icon_path: '', selected_icon_path: '', page_path: '', require_login: false })
}

const removeItem = (index) => {
  if (form.items.length <= 2) return
  form.items.splice(index, 1)
  if (activeTab.value >= form.items.length) activeTab.value = form.items.length - 1
}

const validate = () => {
  if (form.items.length < 2) { Message.warning(t('mini_page.tabbar_min_items')); return false }
  if (form.items.length > 5) { Message.warning(t('mini_page.tabbar_max_items')); return false }
  for (let i = 0; i < form.items.length; i++) {
    const item = form.items[i]
    if (!item.text || !item.page_path) {
      Message.warning(t('mini_page.tabbar_item_required', { n: i + 1 }))
      return false
    }
  }
  return true
}

const handleSave = async () => {
  if (!validate()) return
  saving.value = true
  try {
    await saveMiniTabBar(form)
    Message.success(t('mini_page.save_success'))
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
  finally { saving.value = false }
}


const loadData = async () => {
  try {
    const res = await getMiniTabBar()
    const data = res.data?.data || res.data || {}
    Object.assign(form, {
      color: data.color || '#94a3b8',
      selected_color: data.selected_color || '#2563eb',
      background_color: data.background_color || '#FFFFFF',
      border_style: data.border_style || 'white',
      items: data.items && data.items.length
        ? data.items
        : [
          { text: '首页', icon_path: '', selected_icon_path: '', page_path: '/pages/home/home', require_login: false },
          { text: '分类', icon_path: '', selected_icon_path: '', page_path: '/pages/category/category', require_login: false },
          { text: '购物车', icon_path: '', selected_icon_path: '', page_path: '/pages/cart/cart', require_login: true },
          { text: '收藏', icon_path: '', selected_icon_path: '', page_path: '/pages/favorite/favorite', require_login: false },
          { text: '我的', icon_path: '', selected_icon_path: '', page_path: '/pages/profile/profile', require_login: false },
        ]
    })
  } catch (e) { }
}

onMounted(() => { loadData() })
</script>

<style scoped>
.tabbar-layout { display: flex; gap: 32px; }
.tabbar-form-area { flex: 1; min-width: 0; }
.tabbar-preview-area { width: 375px; flex-shrink: 0; }

.form-section { margin-bottom: var(--spacing-xl); }
.form-section h4 { font-size: 14px; font-weight: 600; color: var(--color-on-surface); margin: 0 0 var(--spacing-base); padding-bottom: 8px; border-bottom: 1px solid var(--color-outline-variant); }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-base); }
.section-header h4 { margin: 0; border: none; padding: 0; }

.form-row { display: flex; gap: 16px; }
.form-row > * { flex: 1; }

.color-input-row { display: flex; gap: 8px; align-items: center; }
.color-picker { width: 36px; height: 36px; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); padding: 2px; cursor: pointer; background: none; }
.color-input-row .form-input { flex: 1; }

.icon-field { display: flex; gap: 8px; align-items: center; }
.icon-field .form-input { flex: 1; min-width: 0; }

.switch-row { display: flex; align-items: center; gap: 10px; }
.toggle-checkbox { accent-color: var(--color-primary); width: 16px; height: 16px; cursor: pointer; }

.tabbar-item-form {
  padding: var(--spacing-base);
  background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  border: 1px solid var(--color-outline-variant);
}
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px; font-weight: 600; color: var(--color-on-surface); }
.muted { font-size: 11px; color: var(--color-on-surface-variant); font-weight: 400; }
.required { color: var(--color-error); }

/* ===== 预览区 — 对照设计稿 ===== */
.preview-label { font-size: 13px; color: var(--color-on-surface-variant); margin-bottom: 8px; font-weight: 500; }
.preview-phone {
  width: 375px; height: 667px;
  background: var(--color-surface-container-lowest);
  border-radius: 28px; border: 4px solid var(--color-on-surface);
  overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}
.preview-content { flex: 1; background: var(--color-surface-container-low); display: flex; align-items: center; justify-content: center; }
.preview-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--color-on-surface-variant); font-size: 13px; }
.preview-tabbar {
  flex-shrink: 0; position: relative;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.04);
}
.preview-tabbar-border { height: 1px; }
.preview-tabbar-inner { display: flex; justify-content: space-around; padding-bottom: 20px; padding-top: 4px; }
.preview-tab-item {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px;
  cursor: pointer;
  transition: opacity 0.2s;
  position: relative;
}
.preview-tab-item:hover { opacity: 0.8; }
.preview-tab-icon {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
  transition: transform 0.2s;
}
.preview-tab-item:has(.preview-cart-icon-wrap) .preview-tab-icon,
.preview-tab-item:not(:has(.preview-cart-icon-wrap)) .preview-tab-icon { /* no-op for fallback */ }

/* 激活态图标放大 */
.preview-tab-item:first-child .preview-tab-icon { /* placeholder */ }

/* 购物车凸起预览 */
.preview-cart-icon-wrap {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin-top: -8px;
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}
.preview-icon-img { width: 20px; height: 20px; object-fit: contain; }
.preview-tab-text { font-size: 10px; margin-top: 0; font-weight: 500; }

@media (max-width: 900px) {
  .tabbar-layout { flex-direction: column; }
  .tabbar-preview-area { width: 100%; }
  .preview-phone { width: 100%; max-width: 375px; margin: 0 auto; }
}
</style>
