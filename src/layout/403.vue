<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">403</div>
      <h2 class="error-title">访问受限</h2>
      <p class="error-desc">抱歉，您没有权限访问此页面。如需访问，请联系管理员开通权限。</p>
      <div class="error-actions">
        <a-button type="primary" @click="$router.back()">返回上一页</a-button>
        <a-button @click="$router.push({ name: 'dashboard' })">回到首页</a-button>
      </div>
    </div>
  </div>
</template>

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
  color: rgb(var(--orange-6));
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