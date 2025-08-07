<template>
  <div class="home-container">
    <n-layout has-sider style="min-height: 100vh;">
      <!-- 左侧菜单 -->
      <n-layout-sider 
        bordered 
        collapse-mode="width" 
        :collapsed-width="64" 
        :width="240" 
        :collapsed="collapsed"
        show-trigger
        @collapse="collapsed = true"
        @expand="collapsed = false"
      >
        <div class="logo-container">
          <n-text class="logo-text" :class="{ collapsed: collapsed }">
            <n-icon :component="BookIcon" :size="24" />
            <span v-if="!collapsed" class="logo-title">QuizPals</span>
          </n-text>
        </div>
        
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :value="activeMenu"
          @update:value="handleMenuSelect"
        />
      </n-layout-sider>

      <!-- 右侧内容区 -->
      <n-layout>
        <!-- 顶部工具栏 -->
        <n-layout-header bordered style="height: 64px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between;">
          <n-text class="page-title" type="primary" :depth="1" strong>
            {{ getPageTitle() }}
          </n-text>
          <n-space>
            <n-time :time="new Date()" format="yyyy-MM-dd HH:mm:ss" />
          </n-space>
        </n-layout-header>

        <!-- 主要内容区域 -->
        <n-layout-content class="content-area">
          <!-- 使用路由视图显示子组件 -->
          <router-view />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NLayout, NLayoutSider, NLayoutHeader, NLayoutContent, NMenu, NText, NIcon, NSpace, NTime
} from 'naive-ui'
import { 
  Book as BookIcon,
  Home as HomeIcon
} from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()

// 菜单状态
const collapsed = ref(false)

// 根据当前路由确定活跃菜单
const activeMenu = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'home'
  if (path === '/practice') return 'practice'
  return 'home'
})

// 菜单配置
const menuOptions = [
  {
    label: '首页',
    key: 'home',
    icon: () => h(NIcon, { component: HomeIcon })
  },
  {
    label: '智能生成题目',
    key: 'practice',
    icon: () => h(NIcon, { component: BookIcon })
  }
]

// 处理菜单选择 - 使用路由跳转
const handleMenuSelect = (key: string) => {
  switch (key) {
    case 'home':
      router.push('/dashboard')
      break
    case 'practice':
      router.push('/practice')
      break
  }
}

// 获取页面标题
const getPageTitle = () => {
  switch (activeMenu.value) {
    case 'home':
      return 'QuizPals - 智能答题系统'
    case 'practice':
      return '智能生成题目'
    default:
      return 'QuizPals'
  }
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--n-border-color);
  padding: 0 16px;
}

.logo-text {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: var(--n-text-color);
  transition: all 0.3s ease;
}

.logo-text.collapsed {
  justify-content: center;
}

.logo-title {
  margin-left: 8px;
  transition: opacity 0.3s ease;
}

.page-title {
  font-size: 20px;
}

.content-area {
  height: calc(100vh - 64px);
  overflow-y: auto;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2b6cb0 100%);
}

:deep(.n-layout-sider) {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

:deep(.n-menu .n-menu-item-content) {
  padding-left: 24px !important;
}

:deep(.n-menu .n-menu-item-content::before) {
  left: 8px;
  right: 8px;
}
</style>