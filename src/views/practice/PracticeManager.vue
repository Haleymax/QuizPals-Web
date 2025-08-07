<template>
  <div class="practice-manager">
    <!-- 上传阶段：显示文件上传界面 -->
    <div v-if="showUpload" class="upload-stage">
      <Upload @file-uploaded="handleFileUploaded" />
    </div>
    
    <!-- 答题阶段：显示答题界面 -->
    <div v-else class="quiz-stage">
      <QuizPage @quiz-completed="handleQuizCompleted" @restart-quiz="restartQuiz" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
</style>
