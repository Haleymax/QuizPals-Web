<template>
  <div class="quiz-container">
    <!-- Header -->
    <n-card class="quiz-header" size="small">
      <n-space justify="space-between" align="center">
        <n-text class="quiz-title" type="primary" :depth="1" strong>
          <n-icon :component="BookIcon" :size="20" style="margin-right: 8px;" />
          QuizPals 在线答题 - {{ currentFilename }}
        </n-text>
        <n-space>
          <n-button secondary @click="$router.push('/upload')">
            <template #icon>
              <n-icon :component="CloudUploadIcon" />
            </template>
            上传文件
          </n-button>
          <n-tag :bordered="false" type="info">
            题目 {{ currentQuestionIndex + 1 }}/{{ questions.length }}
          </n-tag>
          <n-tag :bordered="false" type="success">
            得分 {{ score }}
          </n-tag>
        </n-space>
      </n-space>
    </n-card>

    <!-- Progress Bar -->
    <n-progress 
      type="line" 
      :percentage="progress" 
      :height="8"
      :border-radius="4"
      color="#18a058"
      rail-color="#f0f0f0"
      show-indicator
      :format="(percentage: number) => `${Math.round(percentage)}%`"
      style="margin: 16px 0;"
    />

    <!-- Quiz Content -->
    <n-card v-if="!quizCompleted" class="quiz-card" size="large">
      <template #header>
        <n-space align="center">
          <n-avatar 
            round 
            :size="40" 
            color="#18a058"
            style="font-weight: bold;"
          >
            {{ currentQuestionIndex + 1 }}
          </n-avatar>
          <n-text class="question-text" :depth="1">
            {{ currentQuestion.question }}
          </n-text>
        </n-space>
      </template>
      
      <n-space vertical :size="16">
        <n-radio-group 
          v-model:value="selectedAnswer" 
          name="radiogroup"
          size="large"
        >
          <n-space vertical :size="12">
            <n-radio 
              v-for="(option, index) in currentQuestion.options" 
              :key="index"
              :value="index"
              class="option-radio"
            >
              <n-thing class="option-content">
                <template #avatar>
                  <n-avatar 
                    round 
                    :size="32" 
                    :color="selectedAnswer === index ? '#18a058' : '#f0f0f0'"
                    :style="{ color: selectedAnswer === index ? 'white' : '#666' }"
                  >
                    {{ option.label }}
                  </n-avatar>
                </template>
                <template #header>
                  <n-text :type="selectedAnswer === index ? 'success' : 'default'">
                    {{ option.text }}
                  </n-text>
                </template>
              </n-thing>
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-space>

      <template #action>
        <n-space justify="space-between">
          <n-button 
            secondary 
            :disabled="currentQuestionIndex === 0"
            @click="previousQuestion"
          >
            <template #icon>
              <n-icon :component="ArrowBackIcon" />
            </template>
            上一题
          </n-button>
          
          <n-button 
            type="primary" 
            :disabled="selectedAnswer === null"
            @click="nextQuestion"
            size="large"
          >
            {{ currentQuestionIndex === questions.length - 1 ? '完成答题' : '下一题' }}
            <template #icon>
              <n-icon :component="currentQuestionIndex === questions.length - 1 ? CheckIcon : ArrowForwardIcon" />
            </template>
          </n-button>
        </n-space>
      </template>
    </n-card>

    <!-- Results -->
    <n-card v-else class="results-card" size="large">
      <template #header>
        <n-space align="center" justify="center">
          <n-icon :component="TrophyIcon" :size="32" color="#f0a020" />
          <n-text class="results-title" :depth="1" strong>
            答题完成！
          </n-text>
        </n-space>
      </template>

      <n-space vertical :size="24" style="text-align: center;">
        <!-- Score Display -->
        <n-statistic label="最终得分" tabular-nums>
          <n-number-animation ref="numberAnimationInstRef" :from="0" :to="score || 0" />
          <template #suffix>
            / {{ questions.length }}
          </template>
        </n-statistic>

        <!-- Accuracy -->
        <n-progress 
          type="circle" 
          :percentage="accuracy"
          :stroke-width="12"
          :size="120"
          color="#18a058"
        >
          正确率
        </n-progress>

        <!-- Stats -->
        <n-descriptions bordered :column="2" label-placement="left">
          <n-descriptions-item label="总题数">
            {{ questions.length }}
          </n-descriptions-item>
          <n-descriptions-item label="正确题数">
            <n-text type="success">{{ score }}</n-text>
          </n-descriptions-item>
          <n-descriptions-item label="错误题数">
            <n-text type="error">{{ questions.length - (score || 0) }}</n-text>
          </n-descriptions-item>
          <n-descriptions-item label="正确率">
            <n-text :type="accuracy >= 80 ? 'success' : accuracy >= 60 ? 'warning' : 'error'">
              {{ accuracy.toFixed(1) }}%
            </n-text>
          </n-descriptions-item>
        </n-descriptions>

        <!-- Performance Message -->
        <n-alert 
          :type="accuracy >= 80 ? 'success' : accuracy >= 60 ? 'warning' : 'error'"
          :title="getPerformanceMessage()"
        >
          {{ getPerformanceDescription() }}
        </n-alert>
      </n-space>

      <template #action>
        <n-space justify="center">
          <n-button type="primary" size="large" @click="restartQuiz">
            <template #icon>
              <n-icon :component="RefreshIcon" />
            </template>
            重新开始
          </n-button>
          <n-button secondary size="large" @click="reviewAnswers">
            <template #icon>
              <n-icon :component="BookIcon" />
            </template>
            查看答案
          </n-button>
        </n-space>
      </template>
    </n-card>

    <!-- Review Modal -->
    <n-modal v-model:show="showReview" preset="card" title="答案解析" style="width: 90%; max-width: 800px;">
      <n-scrollbar style="max-height: 60vh;">
        <n-space vertical :size="16">
          <n-card 
            v-for="(question, index) in questions" 
            :key="index"
            size="small"
            :bordered="false"
            class="review-card"
          >
            <template #header>
              <n-space align="center">
                <n-tag 
                  :type="userAnswers[index] === parseInt(question.answer) - 1 ? 'success' : 'error'"
                  round
                >
                  {{ index + 1 }}
                </n-tag>
                <n-text>{{ question.question }}</n-text>
              </n-space>
            </template>
            
            <n-space vertical :size="8">
              <n-text 
                v-for="(option, optionIndex) in question.options"
                :key="optionIndex"
                :type="getOptionType(index, optionIndex, parseInt(question.answer) - 1)"
                :depth="getOptionDepth(index, optionIndex, parseInt(question.answer) - 1)"
              >
                {{ option.label }}. {{ option.text }}
                <n-tag 
                  v-if="optionIndex === parseInt(question.answer) - 1" 
                  type="success" 
                  size="small"
                  style="margin-left: 8px;"
                >
                  正确答案
                </n-tag>
                <n-tag 
                  v-else-if="userAnswers[index] === optionIndex" 
                  type="error" 
                  size="small"
                  style="margin-left: 8px;"
                >
                  你的答案
                </n-tag>
              </n-text>
              
              <n-text v-if="question.explanation" depth="3" style="font-style: italic;">
                解析：{{ question.explanation }}
              </n-text>
            </n-space>
          </n-card>
        </n-space>
      </n-scrollbar>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  NCard, NSpace, NText, NIcon, NTag, NProgress, NAvatar, NThing, 
  NRadioGroup, NRadio, NButton, NStatistic, NNumberAnimation, 
  NDescriptions, NDescriptionsItem, NAlert, NModal, NScrollbar,
  useMessage
} from 'naive-ui'
import { 
  Book as BookIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Checkmark as CheckIcon,
  Trophy as TrophyIcon,
  Refresh as RefreshIcon,
  CloudUpload as CloudUploadIcon
} from '@vicons/ionicons5'

interface Option {
  label: string
  text: string
}

interface Question {
  question: string
  options: Option[]
  answer: string
  explanation?: string
}

interface ApiResponse {
  code: number
  data: {
    content: Question[]
    filename: string
    size: number
  }
  msg: string
}

const message = useMessage()

// 从 sessionStorage 中获取题目数据，如果没有则使用默认数据
const getQuizData = (): ApiResponse => {
  const storedData = sessionStorage.getItem('quizData')
  if (storedData) {
    try {
      return JSON.parse(storedData)
    } catch (error) {
      console.error('解析题目数据失败:', error)
    }
  }
  
  // 默认数据（如果没有从上传页面传来的数据）
  return {
    code: 200,
    data: {
      content: [
        {
          question: "请先上传 Markdown 文件来生成题目",
          options: [
            { label: "1", text: "点击右上角上传按钮" },
            { label: "2", text: "选择 .md 文件" },
            { label: "3", text: "等待题目生成" },
            { label: "4", text: "开始答题" }
          ],
          answer: "4"
        }
      ],
      filename: "示例题目",
      size: 0
    },
    msg: "请上传文件"
  }
}

const quizData = getQuizData()
const questions = ref<Question[]>(quizData.data.content)
const currentFilename = computed(() => quizData.data.filename)

const currentQuestionIndex = ref(0)
const selectedAnswer = ref<number | null>(null)
const userAnswers = ref<(number | null)[]>([])
const quizCompleted = ref(false)
const showReview = ref(false)
const numberAnimationInstRef = ref()

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length) * 100)
const score = computed(() => {
  return userAnswers.value.reduce((acc, answer, index) => {
    if (acc === null) acc = 0
    const correctAnswerIndex = parseInt(questions.value[index].answer) - 1
    return acc + (answer === correctAnswerIndex ? 1 : 0)
  }, 0)
})
const accuracy = computed(() => {
  const scoreValue = score.value || 0
  return (scoreValue / questions.value.length) * 100
})

onMounted(() => {
  userAnswers.value = new Array(questions.value.length).fill(null)
})

const nextQuestion = () => {
  if (selectedAnswer.value === null) {
    message.warning('请选择一个答案')
    return
  }

  userAnswers.value[currentQuestionIndex.value] = selectedAnswer.value

  if (currentQuestionIndex.value === questions.value.length - 1) {
    quizCompleted.value = true
    setTimeout(() => {
      numberAnimationInstRef.value?.play()
    }, 300)
  } else {
    currentQuestionIndex.value++
    selectedAnswer.value = userAnswers.value[currentQuestionIndex.value]
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedAnswer.value = userAnswers.value[currentQuestionIndex.value]
  }
}

const restartQuiz = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  userAnswers.value = new Array(questions.value.length).fill(null)
  quizCompleted.value = false
  showReview.value = false
}

const reviewAnswers = () => {
  showReview.value = true
}

const getPerformanceMessage = () => {
  if (accuracy.value >= 90) return '优秀！'
  if (accuracy.value >= 80) return '良好！'
  if (accuracy.value >= 60) return '及格'
  return '需要加油'
}

const getPerformanceDescription = () => {
  if (accuracy.value >= 90) return '你的表现非常出色，继续保持！'
  if (accuracy.value >= 80) return '表现不错，还有进步空间。'
  if (accuracy.value >= 60) return '基础还可以，建议多加练习。'
  return '需要更多的学习和练习，加油！'
}

const getOptionType = (questionIndex: number, optionIndex: number, correctAnswer: number) => {
  if (optionIndex === correctAnswer) return 'success'
  if (userAnswers.value[questionIndex] === optionIndex) return 'error'
  return 'default'
}

const getOptionDepth = (questionIndex: number, optionIndex: number, correctAnswer: number) => {
  if (optionIndex === correctAnswer || userAnswers.value[questionIndex] === optionIndex) return 1
  return 3
}
</script>

<style scoped>
.quiz-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2b6cb0 100%);
}

.quiz-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.quiz-title {
  font-size: 18px;
  display: flex;
  align-items: center;
}

.quiz-card, .results-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.question-text {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.6;
}

.option-radio {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.option-radio:hover {
  background-color: rgba(24, 160, 88, 0.05);
  border-color: rgba(24, 160, 88, 0.2);
}

.option-content {
  width: 100%;
}

.results-title {
  font-size: 24px;
}

.review-card {
  background: rgba(248, 250, 252, 0.8);
}

:deep(.n-thing-header) {
  margin-bottom: 0;
}

:deep(.n-radio .n-radio__dot) {
  display: none;
}

:deep(.n-radio .n-radio__label) {
  padding-left: 0;
}

:deep(.n-statistic .n-statistic-value__content) {
  font-size: 2.5rem;
  font-weight: bold;
  color: #18a058;
}
</style>