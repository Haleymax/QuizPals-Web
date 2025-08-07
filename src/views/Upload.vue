<template>
  <div class="upload-container">
    <!-- Header -->
    <n-card class="upload-header" size="small">
      <n-space justify="space-between" align="center">
        <n-text class="upload-title" type="primary" :depth="1" strong>
          <n-icon :component="CloudUploadIcon" :size="20" style="margin-right: 8px;" />
          QuizPals 文档上传
        </n-text>
        <n-space>
          <n-tag :bordered="false" type="info">
            <n-icon :component="DocumentIcon" :size="16" style="margin-right: 4px;" />
            支持 Markdown 文件 (.md)
          </n-tag>
          <n-tag :bordered="false" type="success" v-if="uploadedFiles.length > 0">
            已上传 {{ uploadedFiles.length }} 个文件
          </n-tag>
        </n-space>
      </n-space>
    </n-card>

    <!-- Upload Area -->
    <n-card class="upload-card" size="large">
      <template #header>
        <n-space align="center">
          <n-avatar round :size="40" color="#18a058">
            <n-icon :component="FolderOpenIcon" :size="24" />
          </n-avatar>
          <n-text class="section-title" :depth="1">
            选择要上传的文档
          </n-text>
        </n-space>
      </template>

      <n-upload
        ref="uploadRef"
        :action="''"
        :headers="{}"
        :data="{}"
        :file-list="fileList"
        :max="1"
        :on-before-upload="beforeUpload"
        :on-remove="onRemoveFile"
        @update:file-list="updateFileList"
        accept=".md"
        class="upload-dragger"
        :custom-request="customRequest"
      >
        <n-upload-dragger>
          <div class="upload-content">
            <n-icon :component="CloudUploadIcon" :size="64" :depth="3" />
            <n-text class="upload-hint" :depth="2">
              点击或者拖动 Markdown 文件到该区域来上传
            </n-text>
            <n-text class="upload-description" :depth="3">
              支持单个或批量上传 Markdown 文档（.md 格式），系统将自动解析并生成题目
            </n-text>
            <n-space class="upload-tips" justify="center">
              <n-tag type="success" size="small">Markdown</n-tag>
              <n-tag type="info" size="small">.md</n-tag>
            </n-space>
          </div>
        </n-upload-dragger>
      </n-upload>

      <template #action v-if="fileList.length > 0">
        <n-space justify="space-between">
          <n-button secondary @click="clearAllFiles">
            <template #icon>
              <n-icon :component="TrashIcon" />
            </template>
            清空列表
          </n-button>
          
          <n-space>
            <n-button 
              type="primary" 
              :disabled="!hasValidFiles || uploading"
              :loading="uploading"
              @click="startUpload"
              size="large"
            >
              <template #icon>
                <n-icon :component="uploading ? LoadingIcon : SendIcon" />
              </template>
              {{ uploading ? '上传中...' : '上传文件' }}
            </n-button>
          </n-space>
        </n-space>
      </template>
    </n-card>

    <!-- Upload Progress -->
    <n-card v-if="uploading || uploadProgress" class="progress-card" size="large">
      <template #header>
        <n-space align="center">
          <n-avatar round :size="40" color="#f0a020">
            <n-icon :component="AnalyticsIcon" :size="24" />
          </n-avatar>
          <n-text class="section-title" :depth="1">
            上传进度
          </n-text>
        </n-space>
      </template>

      <n-space vertical :size="16">
        <div v-if="uploadProgress" class="progress-item">
          <n-space justify="space-between" align="center" style="margin-bottom: 8px;">
            <n-text>{{ uploadProgress.fileName }}</n-text>
            <n-text :type="uploadProgress.status === 'success' ? 'success' : uploadProgress.status === 'error' ? 'error' : 'default'">
              {{ getProgressText(uploadProgress) }}
            </n-text>
          </n-space>
          <n-progress 
            :percentage="uploadProgress.percentage" 
            :status="uploadProgress.status"
            :height="8"
            :border-radius="4"
          />
        </div>
      </n-space>
    </n-card>

    <!-- Uploaded Files -->
    <n-card v-if="uploadedFiles.length > 0" class="files-card" size="large">
      <template #header>
        <n-space align="center">
          <n-avatar round :size="40" color="#18a058">
            <n-icon :component="CheckmarkCircleIcon" :size="24" />
          </n-avatar>
          <n-text class="section-title" :depth="1">
            已上传文件 ({{ uploadedFiles.length }})
          </n-text>
        </n-space>
      </template>

      <n-space vertical :size="12">
        <n-card 
          v-for="(file, index) in uploadedFiles" 
          :key="index"
          size="small"
          :bordered="false"
          class="file-item"
        >
          <n-space justify="space-between" align="center">
            <n-space align="center">
              <n-avatar round :size="32" :color="getFileTypeColor(file.type)">
                <n-icon :component="getFileTypeIcon(file.type)" :size="16" />
              </n-avatar>
              <div>
                <n-text strong>{{ file.name }}</n-text>
                <n-text :depth="3" style="display: block; font-size: 12px;">
                  {{ formatFileSize(file.size) }} • {{ formatUploadTime(file.uploadTime) }}
                </n-text>
              </div>
            </n-space>
            <n-space>
              <n-button text type="primary" @click="generateQuiz(file)">
                <template #icon>
                  <n-icon :component="PlayIcon" />
                </template>
                生成题目
              </n-button>
              <n-button text type="error" @click="deleteFile(file, index)">
                <template #icon>
                  <n-icon :component="TrashIcon" />
                </template>
              </n-button>
            </n-space>
          </n-space>
        </n-card>
      </n-space>
    </n-card>

    <!-- Empty State -->
    <n-empty 
      v-if="uploadedFiles.length === 0 && !uploading"
      description="暂无已上传的文件"
      class="empty-state"
    >
      <template #icon>
        <n-icon :component="DocumentTextIcon" :size="64" :depth="3" />
      </template>
      <template #extra>
        <n-text :depth="3">
          上传 Markdown 文档（.md 格式）后，系统将自动生成相应的题目供您练习
        </n-text>
      </template>
    </n-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { uploadFile } from '../api/file_upload'
import { 
  NCard, NSpace, NText, NIcon, NTag, NUpload, NUploadDragger, 
  NButton, NProgress, NAvatar, NEmpty, useMessage, useDialog,
  type UploadFileInfo, type UploadInst
} from 'naive-ui'
import { 
  CloudUpload as CloudUploadIcon,
  Document as DocumentIcon,
  FolderOpen as FolderOpenIcon,
  Trash as TrashIcon,
  Send as SendIcon,
  Analytics as AnalyticsIcon,
  CheckmarkCircle as CheckmarkCircleIcon,
  DocumentText as DocumentTextIcon,
  Play as PlayIcon,
  Refresh as LoadingIcon
} from '@vicons/ionicons5'

interface QuizQuestion {
  question: string
  options: {
    label: string
    text: string
  }[]
  answer: string
  explanation?: string
}

interface QuizData {
  code: number
  data: {
    content: QuizQuestion[]
    filename: string
    size: number
  }
  msg: string
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadTime: Date
  url?: string
  quizData?: QuizData
}

interface UploadProgress {
  fileName: string
  percentage: number
  status: 'default' | 'success' | 'error' | 'warning'
}

// 定义事件发射器
const emit = defineEmits<{
  fileUploaded: []
}>()

const message = useMessage()
const dialog = useDialog()
const uploadRef = ref<UploadInst>()

const fileList = ref<UploadFileInfo[]>([])
const uploadedFiles = ref<UploadedFile[]>([])
const uploadProgress = ref<UploadProgress | null>(null)
const uploading = ref(false)

const hasValidFiles = computed(() => {
  return fileList.value.length === 1 && fileList.value[0].status !== 'error'
})

const beforeUpload = (data: { file: UploadFileInfo, fileList: UploadFileInfo[] }) => {
  const file = data.file.file
  if (!file) return false
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    message.error(`文件 ${file.name} 大小超过 10MB`)
    return false
  }
  const allowedTypes = ['.md']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedTypes.includes(fileExtension)) {
    message.error(`仅支持 Markdown 文件（.md 格式），当前文件类型: ${fileExtension}`)
    return false
  }
  return true
}

const updateFileList = (files: UploadFileInfo[]) => {
  fileList.value = files.slice(0, 1)
}

// 单文件上传逻辑
const customRequest = async ({ file, onFinish, onError }: any) => {
  uploading.value = true
  uploadProgress.value = {
    fileName: file.name,
    percentage: 0,
    status: 'default'
  }
  try {
    const formData = new FormData()
    formData.append('mdFile', file.file)
    // 可根据需要添加其他字段
    const res = await uploadFile(formData)
    // 假设后端返回QuizData结构（包含code、data、msg）
    const quizData = res.data
    // 检查题目内容是否存在
    const questionCount =
      Array.isArray(quizData?.data?.content)
        ? quizData.data.content.length
        : Array.isArray(quizData?.content)
          ? quizData.content.length
          : 0;
    const uploadedFile: UploadedFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.file?.size || 0,
      type: getFileType(file.name),
      uploadTime: new Date(),
      url: file.url || undefined,
      quizData
    }
    uploadedFiles.value = [uploadedFile]
    uploadProgress.value = {
      fileName: file.name,
      percentage: 100,
      status: 'success'
    }
    message.success(`文件 ${file.name} 上传成功，已生成 ${questionCount} 道题目`)
    
    // 触发文件上传成功事件
    emit('fileUploaded')
    
    onFinish()
  } catch (error) {
    uploadProgress.value = {
      fileName: file.name,
      percentage: 100,
      status: 'error'
    }
    message.error(`文件 ${file.name} 上传失败`)
    onError()
  } finally {
    uploading.value = false
  }
}

const onRemoveFile = ({ file }: { file: UploadFileInfo }) => {
  message.info(`已移除文件 ${file.name}`)
  return true
}

const startUpload = () => {
  if (!uploadRef.value || uploading.value || !hasValidFiles.value) return
  uploadRef.value.submit()
}

const clearAllFiles = () => {
  dialog.warning({
    title: '确认清空',
    content: '确定要清空文件吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      fileList.value = []
      uploadProgress.value = null
      uploadedFiles.value = []
      message.success('已清空文件')
    }
  })
}

const deleteFile = (file: UploadedFile, index: number) => {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除文件 "${file.name}" 吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      uploadedFiles.value.splice(index, 1)
      message.success('文件已删除')
    }
  })
}

const generateQuiz = (file: UploadedFile) => {
  if (file.quizData) {
    // 将题目数据存储到 sessionStorage 中
    sessionStorage.setItem('quizData', JSON.stringify(file.quizData))
    // 显示成功消息
    message.success('题目生成完成！可以在答题练习页面开始答题')
    // 触发存储事件来通知其他组件数据已更新
    window.dispatchEvent(new Event('storage'))
    
    // 触发文件上传成功事件，让父组件切换到答题页面
    emit('fileUploaded')
  } else {
    message.warning('该文件还没有生成题目，请稍后再试')
  }
}

const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension === 'md' ? 'md' : 'unknown'
}

const getFileTypeColor = (type: string): string => {
  return type === 'md' ? '#96ceb4' : '#95a5a6'
}

const getFileTypeIcon = (_type: string) => {
  return DocumentIcon
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatUploadTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`
  return date.toLocaleDateString()
}

const getProgressText = (progress: UploadProgress): string => {
  switch (progress.status) {
    case 'default': return `${Math.round(progress.percentage)}%`
    case 'success': return '上传成功'
    case 'error': return '上传失败'
    default: return ''
  }
}
</script>

<style scoped>
.upload-container {
  width: 100%;
  height: 100%;
  padding: 24px;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 50%, #2b6cb0 100%);
  overflow-y: auto;
  box-sizing: border-box;
}

.upload-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.upload-title {
  font-size: 18px;
  display: flex;
  align-items: center;
}

.upload-card, .progress-card, .files-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
}

.upload-dragger {
  width: 100%;
}

.upload-content {
  text-align: center;
  padding: 40px 20px;
}

.upload-hint {
  display: block;
  font-size: 16px;
  margin: 16px 0 8px;
}

.upload-description {
  display: block;
  font-size: 14px;
  margin-bottom: 16px;
}

.upload-tips {
  margin-top: 16px;
}

.progress-item {
  padding: 12px;
  background: rgba(248, 250, 252, 0.6);
  border-radius: 8px;
}

.file-item {
  background: rgba(248, 250, 252, 0.8);
  transition: all 0.3s ease;
}

.file-item:hover {
  background: rgba(240, 242, 245, 0.9);
  transform: translateY(-1px);
}

.empty-state {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 40px;
  margin-top: 24px;
}

:deep(.n-upload-dragger) {
  background: rgba(248, 250, 252, 0.3);
  border: 2px dashed rgba(24, 160, 88, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.n-upload-dragger:hover) {
  background: rgba(24, 160, 88, 0.05);
  border-color: rgba(24, 160, 88, 0.5);
}

:deep(.n-upload-dragger.n-upload-dragger--disabled) {
  background: rgba(248, 250, 252, 0.1);
  border-color: rgba(160, 160, 160, 0.3);
}
</style>