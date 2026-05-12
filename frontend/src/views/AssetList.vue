<template>
  <div>
    <el-input v-model="keyword" placeholder="搜索资产名称或编号" style="width: 300px; margin-right: 10px;" @keyup.enter="loadAssets" />
    <el-button type="primary" @click="openAddModal">新增资产</el-button>
    <el-table :data="assets" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="asset_code" label="资产编号" />
      <el-table-column prop="name" label="资产名称" />
      <el-table-column prop="model" label="规格型号" />
      <el-table-column prop="brand" label="品牌" />
      <el-table-column prop="purchase_price" label="采购单价" />
      <el-table-column prop="purchase_date" label="采购时间" />
      <el-table-column prop="supplier" label="供应商" />
      <el-table-column prop="location" label="存放地点" />
      <el-table-column prop="category_name" label="分类" />
      <el-table-column prop="quantity" label="数量" />
      <el-table-column prop="status" label="状态" :formatter="formatStatus" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="openEditModal(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[10, 20, 50]" :page-size="limit" :total="total" layout="total, sizes, prev, pager, next, jumper" />

    <el-dialog title="新增/编辑资产" :visible.sync="modalVisible" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="资产名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="规格型号">
          <el-input v-model="form.model" />
        </el-form-item>
        <el-form-item label="品牌">
          <el-input v-model="form.brand" />
        </el-form-item>
        <el-form-item label="采购单价">
          <el-input v-model="form.purchase_price" type="number" />
        </el-form-item>
        <el-form-item label="采购时间">
          <el-date-picker v-model="form.purchase_date" type="date" />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input v-model="form.supplier" />
        </el-form-item>
        <el-form-item label="存放地点">
          <el-input v-model="form.location" />
        </el-form-item>
        <el-form-item label="资产分类">
          <el-select v-model="form.category_id">
            <el-option v-for="cat in categories" :key="cat.id" :value="cat.id" :label="cat.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量">
          <el-input v-model="form.quantity" type="number" />
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
import { ref, onMounted } from 'vue'
import request from '../utils/request'

const assets = ref([])
const categories = ref([])
const modalVisible = ref(false)
const keyword = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const form = ref({
  id: null,
  name: '',
  model: '',
  brand: '',
  purchase_price: 0,
  purchase_date: '',
  supplier: '',
  location: '',
  category_id: 0,
  quantity: 1,
  description: ''
})

const loadAssets = async () => {
  const res = await request.get('/asset', {
    params: { page: page.value, limit: limit.value, keyword: keyword.value }
  })
  if (res.success) {
    assets.value = res.data
    total.value = res.total
  }
}

const loadCategories = async () => {
  const res = await request.get('/category')
  if (res.success) {
    categories.value = res.data
  }
}

const openAddModal = () => {
  form.value = {
    id: null, name: '', model: '', brand: '', purchase_price: 0,
    purchase_date: '', supplier: '', location: '', category_id: 0,
    quantity: 1, description: ''
  }
  modalVisible.value = true
}

const openEditModal = (row) => {
  form.value = { ...row }
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.name) {
    alert('请输入资产名称')
    return
  }
  
  if (form.value.id) {
    const res = await request.put(`/asset/${form.value.id}`, form.value)
    if (res.success) alert('编辑成功')
  } else {
    const res = await request.post('/asset', form.value)
    if (res.success) alert('新增成功')
  }
  modalVisible.value = false
  loadAssets()
}

const handleDelete = async (row) => {
  if (confirm(`确定要删除资产 "${row.name}" 吗？`)) {
    const res = await request.delete(`/asset/${row.id}`)
    if (res.success) {
      alert('删除成功')
      loadAssets()
    }
  }
}

const formatStatus = (row) => {
  const statusMap = { in_stock: '在库', used: '已领用', scrapped: '已报废' }
  return statusMap[row.status] || row.status
}

const handleSizeChange = (val) => {
  limit.value = val
  loadAssets()
}

const handleCurrentChange = (val) => {
  page.value = val
  loadAssets()
}

onMounted(() => {
  loadAssets()
  loadCategories()
})
</script>