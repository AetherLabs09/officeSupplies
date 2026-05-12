<template>
  <div>
    <el-table :data="applies" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="apply_no" label="申请编号" />
      <el-table-column prop="user_name" label="申请人" />
      <el-table-column prop="department" label="部门" />
      <el-table-column prop="asset_name" label="资产名称" />
      <el-table-column prop="quantity" label="领用数量" />
      <el-table-column prop="purpose" label="用途" />
      <el-table-column prop="apply_time" label="申请时间" />
      <el-table-column prop="status" label="状态" :formatter="formatStatus" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" type="success" @click="handleApprove(scope.row)" v-if="scope.row.status === 'pending'">同意</el-button>
          <el-button size="small" type="danger" @click="handleReject(scope.row)" v-if="scope.row.status === 'pending'">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[10, 20, 50]" :page-size="limit" :total="total" layout="total, sizes, prev, pager, next, jumper" />

    <el-dialog :title="approvalTitle" :visible.sync="approvalModalVisible" width="400px">
      <el-form :model="approvalForm" label-width="80px">
        <el-form-item label="审批意见">
          <el-input v-model="approvalForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="approvalModalVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApproval">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import request from '../utils/request'

const applies = ref([])
const approvalModalVisible = ref(false)
const currentApply = ref(null)
const approvalAction = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const approvalForm = ref({
  remark: ''
})

const approvalTitle = computed(() => {
  return approvalAction.value === 'approve' ? '同意申请' : '驳回申请'
})

const loadApplies = async () => {
  const res = await request.get('/apply', { params: { page: page.value, limit: limit.value } })
  if (res.success) {
    applies.value = res.data
    total.value = res.total
  }
}

const handleApprove = (row) => {
  currentApply.value = row
  approvalAction.value = 'approve'
  approvalForm.value.remark = ''
  approvalModalVisible.value = true
}

const handleReject = (row) => {
  currentApply.value = row
  approvalAction.value = 'reject'
  approvalForm.value.remark = ''
  approvalModalVisible.value = true
}

const submitApproval = async () => {
  const status = approvalAction.value === 'approve' ? 'approved' : 'rejected'
  const res = await request.post('/approval/approve', {
    apply_id: currentApply.value.id,
    approver_id: 1,
    level: 1,
    status,
    remark: approvalForm.value.remark
  })
  if (res.success) {
    alert('审批完成')
    approvalModalVisible.value = false
    loadApplies()
  } else {
    alert(res.message)
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