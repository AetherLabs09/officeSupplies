<template>
  <div>
    <el-button type="primary" @click="openAddModal">新增分类</el-button>
    <el-table :data="categories" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="parent_id" label="上级分类" :formatter="formatParent" />
      <el-table-column prop="type" label="类型" :formatter="formatType" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="status" label="状态" :formatter="formatStatus" />
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="openEditModal(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">停用</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="新增/编辑分类" :visible.sync="modalVisible" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-select v-model="form.parent_id">
            <el-option :value="0" label="无" />
            <el-option v-for="cat in parentCategories" :key="cat.id" :value="cat.id" :label="cat.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type">
            <el-option value="office" label="办公用品" />
            <el-option value="fixed" label="固定资产" />
            <el-option value="consumable" label="低值易耗品" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import request from '../utils/request'

const categories = ref([])
const modalVisible = ref(false)
const form = ref({
  id: null,
  name: '',
  parent_id: 0,
  type: 'office',
  description: ''
})

const parentCategories = computed(() => {
  return categories.value.filter(c => c.status === 1)
})

const loadCategories = async () => {
  const res = await request.get('/category/all')
  if (res.success) {
    categories.value = res.data
  }
}

const openAddModal = () => {
  form.value = { id: null, name: '', parent_id: 0, type: 'office', description: '' }
  modalVisible.value = true
}

const openEditModal = (row) => {
  form.value = { ...row }
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.name) {
    alert('请输入分类名称')
    return
  }
  
  if (form.value.id) {
    const res = await request.put(`/category/${form.value.id}`, form.value)
    if (res.success) {
      alert('编辑成功')
    }
  } else {
    const res = await request.post('/category', form.value)
    if (res.success) {
      alert('新增成功')
    }
  }
  modalVisible.value = false
  loadCategories()
}

const handleDelete = async (row) => {
  if (confirm(`确定要停用分类 "${row.name}" 吗？`)) {
    const res = await request.delete(`/category/${row.id}`)
    if (res.success) {
      alert('操作成功')
      loadCategories()
    }
  }
}

const formatParent = (row) => {
  const parent = categories.value.find(c => c.id === row.parent_id)
  return parent ? parent.name : '无'
}

const formatType = (row) => {
  const types = { office: '办公用品', fixed: '固定资产', consumable: '低值易耗品' }
  return types[row.type] || row.type
}

const formatStatus = (row) => {
  return row.status === 1 ? '启用' : '停用'
}

loadCategories()
</script>