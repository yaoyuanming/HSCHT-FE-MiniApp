<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="logo">
        <div class="logo-img">
          <span class="logo-lines"></span>
          <span class="logo-lines short"></span>
        </div>
        <span class="title">服务管理系统</span>
      </div>
      <div class="header-right">
        <el-badge :value="3" class="notification-badge">
          <el-icon :size="20" color="#606266"><Bell /></el-icon>
        </el-badge>
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="user-info">
            <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
            <span class="username">管理员</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    
    <el-container class="main-container">
      <el-aside width="240px" class="aside">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
          :unique-opened="true"
        >
          <el-menu-item index="/service">
            <el-icon><Menu /></el-icon>
            <span>服务管理</span>
          </el-menu-item>
          <el-menu-item index="/course">
            <el-icon><List /></el-icon>
            <span>课程管理</span>
          </el-menu-item>
          <el-menu-item index="/guide">
            <el-icon><TrendCharts /></el-icon>
            <span>指南管理</span>
          </el-menu-item>
          <el-menu-item index="/logs">
            <el-icon><Timer /></el-icon>
            <span>服务日志</span>
          </el-menu-item>
          <el-menu-item index="/config">
            <el-icon><Setting /></el-icon>
            <span>服务配置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Menu, List, TrendCharts, Timer, Setting, Bell, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta.activeMenu) {
    return meta.activeMenu
  }
  return path
})

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(() => {
        ElMessage({
          type: 'success',
          message: '退出登录成功',
        })
        // 这里可以添加清除token等逻辑
        // router.push('/login') 
      })
      .catch(() => {
        // 取消退出
      })
  } else if (command === 'profile') {
    ElMessage.info('进入个人中心')
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.logo-lines {
  display: block;
  width: 100%;
  height: 4px;
  background-color: #409EFF;
  border-radius: 2px;
}

.logo-lines.short {
  width: 60%;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.notification-badge {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #606266;
}

.main-container {
  flex: 1;
  overflow: hidden;
  background-color: #F5F7FA;
}

.aside {
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
  height: 100%;
}

.sidebar-menu {
  border-right: none;
  padding-top: 10px;
}

:deep(.el-menu-item) {
  height: 50px;
  margin: 4px 0;
  border-radius: 0 24px 24px 0;
  margin-right: 10px;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecf5ff;
  color: #409EFF;
  font-weight: 600;
  position: relative;
}

:deep(.el-menu-item.is-active)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #409EFF;
}

.main-content {
  padding: 24px;
  overflow-y: auto;
}
</style>
