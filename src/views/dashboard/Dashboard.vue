<template>
  <div class="dashboard-content">
    <n-space vertical :size="40" align="center">
      <!-- 欢迎卡片 -->
      <n-card class="welcome-card" size="large">
        <template #header>
          <n-space align="center" justify="center">
            <n-icon :component="BookIcon" :size="64" color="#18a058" />
          </n-space>
        </template>
        
        <n-space vertical :size="24" style="text-align: center;">
          <div>
            <n-text class="welcome-title" :depth="1" strong>
              欢迎使用 QuizPals 智能答题系统
            </n-text>
            <br><br>
            <n-text class="welcome-subtitle" :depth="2">
              基于人工智能技术的学习伴侣平台
            </n-text>
          </div>
          
          <n-divider />
          
          <n-text class="description" :depth="2">
            QuizPals 是一个现代化的在线学习平台，通过智能解析 Markdown 文档，
            自动生成高质量的选择题，为用户提供个性化的学习体验。
            无论是学生复习、教师出题还是企业培训，都能在这里找到最适合的解决方案。
          </n-text>
        </n-space>
      </n-card>

      <!-- 功能介绍 -->
      <n-grid :cols="3" :x-gap="24" :y-gap="24" responsive="screen" class="features-grid">
        <n-grid-item>
          <n-card class="feature-card" hoverable>
            <template #header>
              <n-space align="center" justify="center">
                <n-icon :component="BulbIcon" :size="32" color="#f0a020" />
              </n-space>
            </template>
            <n-space vertical :size="12" style="text-align: center;">
              <n-text strong>智能解析</n-text>
              <n-text :depth="2" style="font-size: 14px;">
                上传 Markdown 文档，AI 自动识别知识点并生成相应的选择题
              </n-text>
            </n-space>
          </n-card>
        </n-grid-item>
        
        <n-grid-item>
          <n-card class="feature-card" hoverable>
            <template #header>
              <n-space align="center" justify="center">
                <n-icon :component="BookIcon" :size="32" color="#18a058" />
              </n-space>
            </template>
            <n-space vertical :size="12" style="text-align: center;">
              <n-text strong>智能答题</n-text>
              <n-text :depth="2" style="font-size: 14px;">
                美观的答题界面，实时进度跟踪，详细的成绩分析和答案解析
              </n-text>
            </n-space>
          </n-card>
        </n-grid-item>
        
        <n-grid-item>
          <n-card class="feature-card" hoverable>
            <template #header>
              <n-space align="center" justify="center">
                <n-icon :component="StatsIcon" :size="32" color="#2080f0" />
              </n-space>
            </template>
            <n-space vertical :size="12" style="text-align: center;">
              <n-text strong>学习分析</n-text>
              <n-text :depth="2" style="font-size: 14px;">
                完整的答题记录，智能统计分析，帮助你更好地了解学习进度
              </n-text>
            </n-space>
          </n-card>
        </n-grid-item>
      </n-grid>

      <!-- 平台信息 -->
      <n-card class="info-card">
        <template #header>
          <n-space align="center" justify="center">
            <n-icon :component="InfoIcon" :size="20" color="#2080f0" />
            <n-text strong>平台信息</n-text>
          </n-space>
        </template>
        <n-descriptions :column="2" label-placement="left">
          <n-descriptions-item label="版本">
            v1.0.0
          </n-descriptions-item>
          <n-descriptions-item label="更新时间">
            2025-08-07
          </n-descriptions-item>
          <n-descriptions-item label="支持格式">
            Markdown (.md)
          </n-descriptions-item>
          <n-descriptions-item label="开发团队">
            QuizPals Team
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- 当前题库信息 -->
      <n-card class="current-quiz-card" v-if="hasQuizData">
        <template #header>
          <n-space align="center" justify="center">
            <n-icon :component="FolderIcon" :size="20" color="#18a058" />
            <n-text strong>当前题库状态</n-text>
          </n-space>
        </template>
        <n-descriptions :column="3" label-placement="left">
          <n-descriptions-item label="文件名">
            <n-tag type="info">{{ quizStats?.filename }}</n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="题目数量">
            <n-text type="primary" strong>{{ quizStats?.questionCount }} 道</n-text>
          </n-descriptions-item>
          <n-descriptions-item label="文件大小">
            {{ quizStats ? formatFileSize(quizStats.size) : '0 B' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  NCard, NSpace, NText, NIcon, NTag, NGrid, NGridItem, NDescriptions, 
  NDescriptionsItem, NDivider
} from 'naive-ui'
import { 
  Book as BookIcon,
  Bulb as BulbIcon,
  StatsChart as StatsIcon,
  Folder as FolderIcon,
  InformationCircle as InfoIcon
} from '@vicons/ionicons5'

interface QuizStats {
  filename: string
  questionCount: number
  size: number
}

// 从 sessionStorage 中获取题目数据统计
const getQuizStats = (): QuizStats | null => {
  const storedData = sessionStorage.getItem('quizData')
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData)
      if (parsed.data && Array.isArray(parsed.data.content)) {
        return {
          filename: parsed.data.filename || '未知文件',
          questionCount: parsed.data.content.length,
          size: parsed.data.size || 0
        }
      } else if (Array.isArray(parsed.content)) {
        return {
          filename: parsed.filename || '未知文件',
          questionCount: parsed.content.length,
          size: parsed.size || 0
        }
      }
    } catch (error) {
      console.error('解析题目数据失败:', error)
    }
  }
  return null
}

const quizStats = computed(() => getQuizStats())
const hasQuizData = computed(() => quizStats.value !== null)

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.dashboard-content {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
}

.welcome-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: none;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  max-width: 700px;
  margin: 0 auto;
}

.welcome-title {
  font-size: 28px;
  margin-bottom: 8px;
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--n-text-color-2);
}

.description {
  font-size: 15px;
  line-height: 1.8;
  max-width: 500px;
  margin: 0 auto;
}

.features-grid {
  max-width: 800px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  height: 100%;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.info-card, .current-quiz-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  max-width: 500px;
  margin: 0 auto;
}

:deep(.n-grid-item) {
  display: flex;
}

:deep(.n-card) {
  height: 100%;
}
</style>
