<template>
  <div class="add-article-page">
    <el-card class="form-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">新建文章</span>
          <el-button link class="close-btn" @click="goBack">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <el-form :model="form" label-position="top" class="article-form">
        <el-form-item label="文章名称">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>

        <el-form-item label="服务类型">
          <el-select v-model="form.serviceType" placeholder="请选择服务类型" style="width: 100%">
            <el-option label="投资架构" value="Investment Architecture" />
            <el-option label="投资架构设计" value="Investment Architecture Design" />
            <!-- Add more options as needed -->
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="草稿" style="width: 100%">
            <el-option label="草稿" value="Draft" />
            <el-option label="已发布" value="Published" />
            <el-option label="已禁用" value="Disabled" />
          </el-select>
        </el-form-item>

        <el-form-item label="文章图片">
          <el-upload
            class="article-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleImageChange"
            list-type="picture-card"
          >
            <img v-if="imageUrl" :src="imageUrl" class="article-image" />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="文章详情">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入文章详细内容"
            resize="none"
          />
        </el-form-item>
      </el-form>

      <div class="form-footer">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Close, Plus } from '@element-plus/icons-vue'

const router = useRouter()

const form = reactive({
  title: '',
  serviceType: '',
  status: 'Draft',
  content: ''
})

const imageUrl = ref('')

const handleImageChange = (uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw)
}

const goBack = () => {
  router.back()
}

const save = () => {
  console.log('Save Article:', form)
  goBack()
}
</script>

<style scoped>
.add-article-page {
  /* padding: 20px; */
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

.article-form {
  padding: 0 20px;
}

/* Upload styles to match the square box in the image */
:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  background-color: #F5F7FA;
  border: 1px dashed #DCDFE6;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-upload--picture-card:hover) {
  border-color: #409EFF;
}

.upload-icon {
  font-size: 24px;
  color: #8c939d;
}

.article-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 3px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
  padding: 20px 20px 0;
  border-top: 1px solid #EBEEF5;
}
</style>
