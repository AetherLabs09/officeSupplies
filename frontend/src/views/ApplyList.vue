<template>
  <div>
    <el-button type="primary" @click="openAddModal">新增领用申请</el-button>
    <el-table :data="applies" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="apply_no" label="申请编号" />
      <el-table-column prop="user_name" label="申请人" />
      <el-table-column prop="department" label="部门" />
      <el-table-column prop="asset_name" label="资产名称" />
      <el-table-column prop="asset_code" label="资产编号" />
      <el-table-column prop="quantity" label="领用数量" />
      <el-table-column prop="purpose" label="用途" />
      <el-table-column prop="apply_time" label="申请时间" />
      <el-table-column prop="status" label="状态" :formatter="formatStatus" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button size="small" @click="openEditModal(scope.row)" v-if="scope.row.status === 'pending'">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)" v-if="scope.row.status === 'pending'">取消</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[10, 20, 50]" :page-size="limit" :total="total" layout="total, sizes, prev, pager, next, jumper" />

    <el-dialog title="新增领用申请" :visible.sync="modalVisible" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="申请人">
          <el-select v-model="form.user_id">
            <el-option :value="1" label="管理员" />
            <el-option :value="2" label="普通用户" />
          </el-select>
        </el-form-item>
        <el-form-item label="资产编号">
          <el-input v-model="form.asset_code" />
        </el-form-item>
        <el-form-item label="领用数量">
          <el-input v-model="form.quantity" type="number" />
        </el-form-item>
        <el-form-item label="用途">
          <el-input v-model="form.purpose" type="textarea" />
        </el-form-item>
        <el-form-item label="申请时间">
          <el-date-picker v-model="form.apply_time" type="datetime" />
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

const applies = ref([])
const modalVisible = ref(false)
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const form = ref({
  id: null,
  user_id: 1,
  asset_code: '',
  quantity: 1,
  purpose: '',
  apply_time: new Date().toISOString()
})

const loadApplies = async () => {
  const res = await request.get('/apply', { params: { page: page.value, limit: limit.value } })
  if (res.success) {
    applies.value = res.data
    total.value = res.total
  }
}

const openAddModal = () => {
  form.value = { id: null, user_id: 1, asset_code: '', quantity: 1, purpose: '', apply_time: new Date().toISOString() }
  modalVisible.value = true
}

const openEditModal = (row) => {
  form.value = { ...row }
  modalVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.asset_code) {
    alert('请输入资产编号')
    return
  }
  if (form.value.id) {
    const res = await request.put(`/apply/${form.value.id}`, form.value)
    if (res.success) alert('编辑成功')
  } else {
    const res = await request.post('/apply', form.value)
    if (res.success) {
      alert('申请提交成功')
    } else {
      alert(res.message)
    }
  }
  modalVisible.value = false
  loadApplies()
}

const handleDelete = async (row) => {
  if (confirm(`确定要取消申请 "${row.apply_no}" 吗？`)) {
    const res = await request.delete(`/apply/${row.id}`)
    if (res.success) {
      alert('取消成功')
      loadApplies()
    }
  }
}

const formatStatus = (row) => {
  const statusMap = { pending: '待审批', approved: '已通过', rejected: '已驳回' }
  return statusMap[row.status] || row.status
}

const handleSizeChange = (val) => {
  limit.value = val
  loadApplies()
}

const handleCurrentChange = (val) => {
  page.value = val
  loadApplies()
}

onMounted(() => {
  loadApplies()
})
</script>