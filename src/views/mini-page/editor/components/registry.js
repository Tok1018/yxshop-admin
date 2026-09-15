import { defineAsyncComponent, h } from 'vue'

const async = (loader) => defineAsyncComponent({
  loader,
  errorComponent: { render: () => h('div', { class: 'component-missing' }, '组件未安装') },
  delay: 0,
  timeout: 3000
})

// 商业版组件安全加载：商业版代码不存在时显示"组件未安装"
// 仅在商业版合并后使用，开源版不会注册商业版组件
const safeAsync = (loader) => defineAsyncComponent({
  loader: async () => {
    try {
      return await loader()
    } catch (e) {
      return { render: () => h('div', { class: 'component-missing' }, '组件未安装') }
    }
  },
  delay: 0
})

export const componentRegistry = {
  search_bar: {
    name: '搜索栏',
    category: 'basic',
    renderer: async(() => import('./basic/SearchBar.vue')),
    editor: async(() => import('./basic/SearchBarEditor.vue')),
    defaultProps: { placeholder: '搜索商品', style: 'round', show_scan: true, show_msg: false, msg_dot: false, show_city: false, city_name: '' }
  },
  swiper: {
    name: '轮播图',
    category: 'basic',
    renderer: async(() => import('./basic/Swiper.vue')),
    editor: async(() => import('./basic/SwiperEditor.vue')),
    defaultProps: { images: [], autoplay: true, interval: 3000, circular: true, indicator_dots: true }
  },
  notice_bar: {
    name: '公告栏',
    category: 'basic',
    renderer: async(() => import('./basic/NoticeBar.vue')),
    editor: async(() => import('./basic/NoticeBarEditor.vue')),
    defaultProps: { content: '', scrollable: true, icon: 'volume', text_color: '#ffffff', background_color: 'rgba(255,255,255,0.12)' }
  },
  rich_text: {
    name: '富文本',
    category: 'basic',
    renderer: async(() => import('./basic/RichText.vue')),
    editor: async(() => import('./basic/RichTextEditor.vue')),
    defaultProps: { content: '' }
  },
  image_ad: {
    name: '图片广告',
    category: 'basic',
    renderer: async(() => import('./basic/ImageAd.vue')),
    editor: async(() => import('./basic/ImageAdEditor.vue')),
    defaultProps: { layout: 'single', images: [] }
  },
  grid_nav: {
    name: '宫格导航',
    category: 'basic',
    renderer: async(() => import('./basic/GridNav.vue')),
    editor: async(() => import('./basic/GridNavEditor.vue')),
    defaultProps: { columns: 4, items: [] }
  },
  product_list: {
    name: '商品列表',
    category: 'commerce',
    renderer: async(() => import('./commerce/ProductList.vue')),
    editor: async(() => import('./commerce/ProductListEditor.vue')),
    defaultProps: { source_type: 'manual', item_ids: [], category_id: '', tag_id: '', display_count: 6, sort_by: 'newest', display_style: 'two_small', show_sales: true, show_tags: false, show_cart: true, title: '', icon: '', tag_text: '', show_more: true, more_link: '', columns: 2 }
  },
  coupon: {
    name: '优惠券',
    category: 'commerce',
    renderer: async(() => import('./commerce/Coupon.vue')),
    editor: async(() => import('./commerce/CouponEditor.vue')),
    defaultProps: { coupon_ids: [] }
  },
  // ===== 商业版组件（合并商业版时取消注释） =====
  // seckill: {
  //   name: '限时秒杀', category: 'marketing', edition: 'commercial',
  //   renderer: safeAsync(() => import('./marketing/Seckill.vue')),
  //   editor: safeAsync(() => import('./marketing/SeckillEditor.vue')),
  //   defaultProps: { session_id: '', max_items: 4 }
  // },
  // group_buy: {
  //   name: '拼团活动', category: 'marketing', edition: 'commercial',
  //   renderer: safeAsync(() => import('./marketing/GroupBuy.vue')),
  //   editor: safeAsync(() => import('./marketing/GroupBuyEditor.vue')),
  //   defaultProps: { group_buy_ids: [], display_style: 'grid' }
  // },
  // ====================================================
  coupon_receive: {
    name: '优惠券领取',
    category: 'marketing',
    renderer: async(() => import('./marketing/CouponReceive.vue')),
    editor: async(() => import('./marketing/CouponReceiveEditor.vue')),
    defaultProps: { coupon_ids: [] }
  },
  point_exchange: {
    name: '积分兑换',
    category: 'marketing',
    edition: 'open_source',
    renderer: async(() => import('./marketing/PointExchange.vue')),
    editor: async(() => import('./marketing/PointExchangeEditor.vue')),
    defaultProps: { point_item_ids: [] }
  },
  promo_banner: {
    name: '推广横幅',
    category: 'basic',
    renderer: async(() => import('./basic/PromoBanner.vue')),
    editor: async(() => import('./basic/PromoBannerEditor.vue')),
    defaultProps: { style: 'solid', bg_color1: '#2563eb', bg_color2: '#3b82f6', icon: '', icon_bg: '', title: '', subtitle: '', btn_text: '', btn_link: '', show_pulse: false }
  },
  promo_grid: {
    name: '推广卡片网格',
    category: 'basic',
    renderer: async(() => import('./basic/PromoGrid.vue')),
    editor: async(() => import('./basic/PromoGridEditor.vue')),
    defaultProps: { layout: 'one_big_two_small', cards: [] }
  },
  brand_zone: {
    name: '品牌专区',
    category: 'commerce',
    renderer: async(() => import('./commerce/BrandZone.vue')),
    editor: async(() => import('./commerce/BrandZoneEditor.vue')),
    defaultProps: { title: '品牌专区', more_text: '查看全部', more_link: '', columns: 4, source_type: 'system', is_hot: 0, limit: 8, items: [] }
  }
}