<template>
  <div class="product-list-preview">
    <div v-if="compProps.title" class="product-list-header">
      <div class="header-left">
        <MpIcon v-if="compProps.icon" :name="compProps.icon" :size="16" color="#0f172a" />
        <span class="section-title">{{ compProps.title }}</span>
        <span v-if="compProps.tag_text" class="header-tag">{{ compProps.tag_text }}</span>
      </div>
      <span v-if="compProps.show_more" class="header-more">查看全部 ›</span>
    </div>

    <!-- 展示样式: one_big — 大图单列（图左文右） -->
    <div v-if="displayStyle === 'one_big'" class="product-list-big">
      <div v-for="i in previewCount" :key="i" class="product-card-big">
        <div class="product-thumb-big">
          <div class="thumb-fallback">
            <MpIcon name="package" :size="32" color="#94a3b8" />
            <span class="thumb-fallback-text">暂无图片</span>
          </div>
          <div v-if="compProps.show_cart" class="cart-btn">
            <MpIcon name="plus" :size="12" color="#fff" />
          </div>
        </div>
        <div class="product-info-big">
          <div class="product-name">{{ t('mini_page.product_name_sample') }}</div>
          <div class="product-tags" v-if="compProps.show_tags">
            <span class="mini-tag tag-success">包邮</span>
            <span class="mini-tag tag-primary">正品</span>
          </div>
          <div class="product-bottom">
            <div class="price-area">
              <span class="price-symbol">¥</span>
              <span class="product-price">99.00</span>
              <span v-if="compProps.show_sales" class="product-origin">¥199.00</span>
            </div>
            <span v-if="compProps.show_sales && !compProps.show_cart" class="product-sales">{{ t('mini_page.sales_sample') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 展示样式: one_big_two_small — 首个大图 + 后续双列小图 -->
    <div v-else-if="displayStyle === 'one_big_two_small'" class="product-list-mix">
      <!-- 首个大图卡片 -->
      <div class="product-card-big" v-if="previewCount > 0">
        <div class="product-thumb-big">
          <div class="thumb-fallback">
            <MpIcon name="package" :size="32" color="#94a3b8" />
            <span class="thumb-fallback-text">暂无图片</span>
          </div>
          <div v-if="compProps.show_cart" class="cart-btn">
            <MpIcon name="plus" :size="12" color="#fff" />
          </div>
        </div>
        <div class="product-info-big">
          <div class="product-name">{{ t('mini_page.product_name_sample') }}</div>
          <div class="product-tags" v-if="compProps.show_tags">
            <span class="mini-tag tag-success">包邮</span>
            <span class="mini-tag tag-primary">正品</span>
          </div>
          <div class="product-bottom">
            <div class="price-area">
              <span class="price-symbol">¥</span>
              <span class="product-price">99.00</span>
              <span v-if="compProps.show_sales" class="product-origin">¥199.00</span>
            </div>
            <span v-if="compProps.show_sales && !compProps.show_cart" class="product-sales">{{ t('mini_page.sales_sample') }}</span>
          </div>
        </div>
      </div>
      <!-- 后续小图双列 -->
      <div class="product-grid" :style="{ gridTemplateColumns: `repeat(${compProps.columns || 2}, 1fr)` }">
        <div v-for="i in Math.max(previewCount - 1, 0)" :key="i" class="product-card">
          <div class="product-thumb">
            <div class="thumb-fallback">
              <MpIcon name="package" :size="28" color="#94a3b8" />
              <span class="thumb-fallback-text">暂无图片</span>
            </div>
            <div v-if="compProps.show_cart" class="cart-btn">
              <MpIcon name="plus" :size="12" color="#fff" />
            </div>
          </div>
          <div class="product-info">
            <div class="product-name">{{ t('mini_page.product_name_sample') }}</div>
            <div class="product-tags" v-if="compProps.show_tags">
              <span class="mini-tag tag-success">包邮</span>
              <span class="mini-tag tag-primary">正品</span>
            </div>
            <div class="product-bottom">
              <div class="price-area">
                <span class="price-symbol">¥</span>
                <span class="product-price">99.00</span>
                <span v-if="compProps.show_sales" class="product-origin">¥199.00</span>
              </div>
              <span v-if="compProps.show_sales && !compProps.show_cart" class="product-sales">{{ t('mini_page.sales_sample') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 展示样式: two_small — 标准双列小图（默认） -->
    <div v-else class="product-grid" :style="{ gridTemplateColumns: `repeat(${compProps.columns || 2}, 1fr)` }">
      <div v-for="i in previewCount" :key="i" class="product-card">
        <div class="product-thumb">
          <div class="thumb-fallback">
            <MpIcon name="package" :size="28" color="#94a3b8" />
            <span class="thumb-fallback-text">暂无图片</span>
          </div>
          <div v-if="compProps.show_cart" class="cart-btn">
            <MpIcon name="plus" :size="12" color="#fff" />
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ t('mini_page.product_name_sample') }}</div>
          <div class="product-tags" v-if="compProps.show_tags">
            <span class="mini-tag tag-success">包邮</span>
            <span class="mini-tag tag-primary">正品</span>
          </div>
          <div class="product-bottom">
            <div class="price-area">
              <span class="price-symbol">¥</span>
              <span class="product-price">99.00</span>
              <span v-if="compProps.show_sales" class="product-origin">¥199.00</span>
            </div>
            <span v-if="compProps.show_sales && !compProps.show_cart" class="product-sales">{{ t('mini_page.sales_sample') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MpIcon from '@/components/MpIcon.vue'

const { t } = useI18n()
const props = defineProps({ props: { type: Object, default: () => ({}) } })

/** 解包内层 props 数据，避免模板中 props.props.xxx 的命名冲突 */
const compProps = computed(() => props.props || {})

/** 展示样式：two_small / one_big / one_big_two_small */
const displayStyle = computed(() => compProps.value.display_style || 'two_small')

/** 预览数量：取用户设置的 display_count，预览最多展示 10 个 */
const previewCount = computed(() => Math.min(compProps.value.display_count || 6, 10))
</script>

<style scoped>
.product-list-preview { padding: 6px 12px; }
.product-list-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 4px 6px; }
.header-left { display: flex; align-items: center; gap: 4px; }
.section-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.header-tag { background: rgba(37,99,235,0.1); color: #2563eb; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
.header-more { font-size: 12px; color: #94a3b8; }

/* 标准双列网格 */
.product-grid { display: grid; gap: 8px; }
.product-card { background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #f1f5f9; box-shadow: 0 1px 6px rgba(0,0,0,0.03); }
.product-thumb { height: 120px; position: relative; }

/* 商品图片占位（无图或加载失败时） */
.thumb-fallback {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
}
.thumb-fallback-text { font-size: 11px; color: #94a3b8; }

.cart-btn { position: absolute; bottom: 6px; right: 6px; width: 24px; height: 24px; background: linear-gradient(135deg, #2563eb, #3b82f6); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(37,99,235,0.3); }
.product-info { padding: 7px 9px; }
.product-name { font-size: 12px; color: #0f172a; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.product-tags { display: flex; gap: 4px; margin: 4px 0; }
.mini-tag { font-size: 9px; font-weight: 600; padding: 1px 4px; border-radius: 3px; }
.tag-success { background: #ecfdf5; color: #047857; }
.tag-primary { background: #eff6ff; color: #1e40af; }
.product-bottom { display: flex; align-items: flex-end; justify-content: space-between; }
.price-area { display: flex; align-items: baseline; gap: 3px; }
.price-symbol { font-size: 11px; color: #dc2626; font-weight: 700; }
.product-price { font-size: 15px; color: #dc2626; font-weight: 700; }
.product-origin { font-size: 10px; color: #94a3b8; text-decoration: line-through; }
.product-sales { font-size: 10px; color: #999; }

/* 大图单列样式（one_big / one_big_two_small 首项） */
.product-list-big { display: flex; flex-direction: column; gap: 8px; }
.product-list-mix { display: flex; flex-direction: column; gap: 8px; }
.product-card-big {
  background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9;
  box-shadow: 0 1px 6px rgba(0,0,0,0.03);
  display: flex; gap: 0;
}
.product-thumb-big { width: 120px; min-width: 120px; height: 120px; position: relative; }
.product-info-big { flex: 1; padding: 10px 12px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
.product-info-big .product-name { font-size: 14px; white-space: normal; line-height: 1.3; }
.product-info-big .product-tags { margin: 2px 0; }
.product-info-big .product-price { font-size: 17px; }
</style>
