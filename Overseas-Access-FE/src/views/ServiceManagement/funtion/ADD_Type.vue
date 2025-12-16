<template>
  <div class="add-type-page">
    <el-card class="form-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">新建类型</span>
          <el-button link class="close-btn" @click="goBack">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <el-form :model="form" label-position="top" class="type-form">
        <el-form-item label="所属国家">
          <el-select v-model="form.country" placeholder="选择国家" style="width: 100%">
            <el-option label="中国" value="China" />
            <el-option label="美国" value="USA" />
            <el-option label="日本" value="Japan" />
            <el-option label="德国" value="Germany" />
            <el-option label="英国" value="UK" />
          </el-select>
        </el-form-item>

        <el-form-item label="类型名称">
          <el-input v-model="form.typeName" placeholder="输入类型名称" />
        </el-form-item>

        <el-form-item label="类型图标" class="icon-upload-item">
          <el-upload
            class="icon-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleIconChange"
            drag
          >
            <img v-if="imageUrl" :src="imageUrl" class="icon-image" />
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-text">点击上传或拖放文件</div>
              <div class="upload-tip">支持 PNG, JPG, SVG 格式，大小不超过 2MB</div>
            </div>
          </el-upload>
        </el-form-item>

        <div class="form-footer">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="save">保存</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Close, UploadFilled } from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
  country: '',
  typeName: ''
})

const imageUrl = ref('')

const handleIconChange = (uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw)
}

const goBack = () => {
  router.back()
}

const save = () => {
  console.log('Save Type:', form)
  goBack()
}
</script>

<style scoped>
.add-type-page {
  /* padding: 20px; */
}

.form-card {
  max-width: 600px; /* Smaller width for type form as per image */
  margin: 0 auto;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.close-btn {
  font-size: 18px;
  color: #909399;
}

.type-form {
  padding: 0 20px;
}

.icon-uploader {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border: 1px dashed #DCDFE6;
  border-radius: 4px;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409EFF;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 32px;
  color: #909399;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

/* If the image is a real uploaded image */
.icon-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 30px;
  margin-bottom: 10px;
}
</style>
