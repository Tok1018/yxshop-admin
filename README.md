# YXShop Admin - 电商管理后台

基于 Vue 3 + Vite + Element Plus + Arco Design 的电商管理后台，配套 YXShop 后端（Webman PHP）使用。

## 技术栈

| 技术 | 说明 |
|------|------|
| Vue 3 | 组合式 API，`<script setup>` |
| Vite 5 | 构建工具，开发热更新 |
| Element Plus + Arco Design | 双 UI 框架混合使用 |
| Pinia | 状态管理（持久化插件） |
| Vue Router 4 | SPA 路由 |
| Vue I18n | 国际化（简体中文 / 繁体中文 / 英文） |
| Tailwind CSS + Less | 原子化 CSS + 预处理器 |
| ECharts | 数据可视化 |
| WangEditor | 富文本编辑器 |
| CodeMirror / Monaco Editor | 代码编辑器 |
| Axios | HTTP 请求 |

## 功能模块

- **仪表盘** - 数据统计概览
- **商品管理** - SPU/SKU、分类、品牌、规格、属性、标签、收藏、搜索
- **订单管理** - 订单列表/详情、发货、物流、日志
- **售后管理** - 退款退货处理
- **用户管理** - 用户列表/详情、地址、等级、优惠券、反馈、日志、资金日志
- **营销管理** - 优惠券、促销活动、充值套餐
- **内容管理** - 文章、分类、单页、友情链接、评论
- **小程序装修** - 页面编辑器（可视化拖拽）、底部 TabBar、主题
- **通知系统** - 通知场景、模板、变量、黑名单、发送记录
- **系统设置** - 菜单、角色权限、管理员、支付配置、物流配送、区域、多语言、货币、SEO
- **日志中心** - 操作日志、邮件日志、短信日志、文件日志、支付日志

## 快速开始

### 环境要求

- Node.js >= 16（推荐 18+）
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

开发服务器默认运行在 `http://localhost:5173`，API 代理到 `http://127.0.0.1:8777`（可在 `.env.development` 中修改）。

### 构建生产包

```bash
npm run build
```

构建产物输出到 `dist/`，将 `dist/` 内容部署到后端 `yxshop-php/public/yxadmin/` 目录即可。

### 预览构建产物

```bash
npm run preview
```

## 环境变量

| 文件 | 用途 |
|------|------|
| `.env` | 通用配置（标题、端口、基础路径、Token 前缀） |
| `.env.development` | 开发环境（API 地址） |
| `.env.production` | 生产环境（API 地址） |

关键变量：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_APP_TITLE` | 页面标题 | 远讯电商管理 |
| `VITE_APP_PORT` | 开发端口 | 5173 |
| `VITE_APP_BASE` | 部署基础路径 | /yxadmin/ |
| `VITE_APP_BASE_URL` | API 基础地址 | 开发: http://127.0.0.1:8777 / 生产: / |
| `VITE_APP_TOKEN_PREFIX` | Token 存储前缀 | yxshop_admin_token |

## 项目结构

```
yxshop-admin/
├── src/
│   ├── api/              # API 请求模块
│   ├── assets/           # 静态资源（图片、CSS）
│   ├── components/       # 全局通用组件
│   ├── config/           # 全局配置（常量、分页、皮肤）
│   ├── directives/       # 自定义指令（auth、copy、role）
│   ├── i18n/             # 国际化（zh_CN / zh_TW / en）
│   ├── layout/           # 布局组件
│   ├── router/           # 路由配置
│   ├── store/            # Pinia 状态管理
│   ├── style/            # 全局样式（Less / CSS / 皮肤主题）
│   ├── utils/            # 工具函数（请求、鉴权、格式化等）
│   ├── views/            # 页面视图
│   ├── App.vue           # 根组件
│   └── main.js           # 应用入口
├── public/               # 公共静态文件
├── .env                  # 通用环境变量
├── .env.development      # 开发环境变量
├── .env.production       # 生产环境变量
├── vite.config.js        # Vite 配置
├── tailwind.config.cjs   # Tailwind CSS 配置
├── postcss.config.cjs    # PostCSS 配置
└── package.json
```

## 部署

1. 执行 `npm run build` 构建生产包
2. 将 `dist/` 目录内容复制到后端项目 `yxshop-php/public/yxadmin/`
3. 通过 Nginx 或 Webman 配置，访问 `https://你的域名/yxadmin/` 即可

## 商业版

商业版（`yxshop-admin-commercial`）在开源版基础上增加了秒杀、拼团、分销、社区养老、直播、供应链、进销存等功能，代码以独立仓库维护，可按需获取。
