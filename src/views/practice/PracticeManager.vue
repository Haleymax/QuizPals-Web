<template>
  <div class="practice-manager">
    <!-- 上传阶段：显示文件上传界面 -->
    <div v-if="showUpload" class="upload-stage">
      <Upload @file-uploaded="handleFileUploaded" />
    </div>
    
    <!-- 答题阶段：显示答题界面 -->
    <div v-else class="quiz-stage">
      <!-- 添加重新开始按钮 -->
      <div class="quiz-header">
        <n-button 
          type="primary" 
          ghost 
          @click="restartQuiz"
          class="restart-btn"
        >
          <template #icon>
            <n-icon :component="RefreshIcon" />
          </template>
          重新上传文件
        </n-button>
      </div>
      <QuizPage @quiz-completed="handleQuizCompleted" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { Refresh as RefreshIcon } from '@vicons/ionicons5'
import Upload from '../Upload.vue'
import QuizPage from '../quiz/QuizPage.vue'

// 控制显示状态
const forceShowUpload = ref(false)

// 检查是否有题目数据
const hasQuizData = computed(() => {
  const questionsData = sessionStorage.getItem('quizData')
  return questionsData !== null && questionsData !== 'null'
})

// 决定是否显示上传页面
const showUpload = computed(() => {
  return forceShowUpload.value || !hasQuizData.value
})

// 处理文件上传成功事件
const handleFileUploaded = () => {
  // 文件上传成功后，重置强制显示上传的状态
  forceShowUpload.value = false
  console.log('文件上传成功，切换到答题模式')
}

// 重新开始答题（清除数据，回到上传页面）
const restartQuiz = () => {
  // 清除 sessionStorage 中的题目数据
  sessionStorage.removeItem('quizData')
  sessionStorage.removeItem('quizQuestions')
  // 强制显示上传页面
  forceShowUpload.value = true
}

// 处理答题完成事件
const handleQuizCompleted = () => {
  console.log('答题完成')
  // 可以在这里添加答题完成后的逻辑
}

// 组件挂载时检查当前状态
onMounted(() => {
  // 如果通过其他路由进入且没有数据，确保显示上传页面
  if (!hasQuizData.value) {
    forceShowUpload.value = true
  }
})
</script>

<style scoped>
.practice-manager {
  height: 100%;
  width: 100%;
}

.upload-stage,
.quiz-stage {
  height: 100%;
  width: 100%;
}

.quiz-header {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.restart-btn {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.restart-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
