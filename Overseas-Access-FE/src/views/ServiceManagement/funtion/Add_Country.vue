<template>
  <div class="add-country-page">
    <el-card class="form-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">新建国家</span>
          <el-button link class="close-btn" @click="goBack">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>
      
      <el-form :model="form" label-position="top" class="country-form">
        <el-form-item label="国旗" class="flag-upload-item">
          <el-upload
            class="flag-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFlagChange"
            drag
          >
            <img v-if="imageUrl" :src="imageUrl" class="flag-image" />
            <div v-else class="upload-placeholder">
              <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" class="upload-icon-img" alt="upload" />
              <div class="upload-text">点击上传或拖拽文件至此处</div>
              <div class="upload-tip">支持 PNG, JPG, GIF 格式，大小不超过 2MB</div>
            </div>
          </el-upload>
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="国家名称">
              <el-input v-model="form.name" placeholder="请输入国家名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="国家代码">
              <el-input v-model="form.code" placeholder="如: CN, US, JP" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="官方语言">
              <el-input v-model="form.language" placeholder="请输入官方语言" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="首都">
              <el-input v-model="form.capital" placeholder="请输入首都名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="人口数量">
          <el-input v-model="form.population" placeholder="请输入人口数量" />
        </el-form-item>

        <el-form-item label="国家面积 (平方公里)">
          <el-input v-model="form.area" placeholder="请输入国家面积" />
        </el-form-item>

        <el-form-item label="国家简介">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入国家简介信息"
          />
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
import { Close } from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
  name: '',
  code: '',
  language: '',
  capital: '',
  population: '',
  area: '',
  description: ''
})

const imageUrl = ref('')

const handleFlagChange = (uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw)
}

const goBack = () => {
  router.back()
}

const save = () => {
  console.log('Save:', form)
  goBack()
}
</script>

<style scoped>
.add-country-page {
  /* padding: 20px; */
  /* If you want it to look like a modal in a separate page, we can center it or fill.
     The image shows it like a card. */
}

.form-card {
  max-width: 800px;
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

.flag-uploader {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #F5F7FA;
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
  gap: 8px;
}

.upload-icon-img {
  width: 60px; /* Adjust as needed */
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 8px;
}

/* If the image is a real uploaded image */
.flag-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.upload-text {
  font-size: 14px;
  color: #606266;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
