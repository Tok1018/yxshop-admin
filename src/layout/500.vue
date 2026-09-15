<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">500</div>
      <h2 class="error-title">服务器错误</h2>
      <p class="error-desc">抱歉，服务器遇到了问题，请稍后重试。如果问题持续存在，请联系技术支持。</p>
      <div class="error-actions">
        <a-button type="primary" @click="retry">重新加载</a-button>
        <a-button @click="$router.push({ name: 'dashboard' })">回到首页</a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
const retry = () => window.location.reload()
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--color-bg-1);
}
.error-content {
  text-align: center;
  padding: 40px;
}
.error-code {
  font-size: 120px;
  font-weight: 700;
  color: rgb(var(--red-6));
  line-height: 1;
  letter-spacing: -0.04em;
}
.error-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-1);
  margin: 16px 0 8px;
}
.error-desc {
  font-size: 14px;
  color: var(--color-text-3);
  margin: 0 0 32px;
  max-width: 400px;
}
.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>