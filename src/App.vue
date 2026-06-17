<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = computed(() => (route.meta.title as string) ?? '二手书淘书个人日志')
</script>

<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-inner">
        <h1 class="app-title">📚 二手书淘书个人日志</h1>
        <el-menu
          :default-active="route.path"
          mode="horizontal"
          router
          :ellipsis="false"
          class="nav-menu"
        >
          <el-menu-item index="/">我的记录</el-menu-item>
          <el-menu-item index="/stats">淘书统计</el-menu-item>
          <el-menu-item index="/inspiration">灵感库</el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main class="app-main">
      <h2 class="page-title">{{ pageTitle }}</h2>
      <router-view />
    </el-main>
  </el-container>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', Arial, sans-serif;
  background-color: #f5f7fa;
}

.app-container {
  min-height: 100vh;
}

.app-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  height: auto !important;
  padding: 0 24px;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 16px;
  padding: 12px 0;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.nav-menu {
  border-bottom: none !important;
  background: transparent !important;
  flex-shrink: 0;
  min-width: 320px;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 24px;
}

.page-title {
  font-size: 18px;
  color: #606266;
  margin-bottom: 20px;
  font-weight: 500;
}
</style>
