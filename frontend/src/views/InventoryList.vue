<template>
  <div>
    <el-button type="primary" @click="openSingleModal">单条入库</el-button>
    <el-button type="success" @click="openBatchModal">批量导入</el-button>
    <el-table :data="inventory" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="asset_code" label="资产编号" />
      <el-table-column prop="quantity" label="入库数量" />
      <el-table-column prop="type" label="类型" :formatter="formatType" />
      <el-table-column prop="operator" label="操作人" />
      <el-table-column prop="remark" label="备注" />
      <el-table-column prop="created_at" label="入库时间" />
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[10, 20, 50]" :page-size="limit" :total="total" layout="total, sizes, prev, pager, next, jumper" />

    <el-dialog title="单条入库" :visible.sync="singleModalVisible" width="400px">
      <el-form :model="singleForm" label-width="80px">
        <el-form-item label="资产编号">
          <el-input v-model="singleForm.asset_code" />
        </el-form-item>
        <el-form-item label="入库数量">
          <el-input v-model="singleForm.quantity" type="number" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="singleForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="singleForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="singleModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSingleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="批量导入" :visible.sync="batchModalVisible" width="600px">
      <el-button type="primary" @click="addBatchItem">添加一行</el-button>
      <el-table :data="batchItems" style="width: 100%; margin-top: 10px;">
        <el-table-column label="资产名称">
          <template #default="scope">
            <el-input v-model="batchItems[scope.$index].name" />
          </template>
        </el-table-column>
        <el-table-column label="分类">
          <template #default="scope">
            <el-select v-model="batchItems[scope.$index].category_id">
              <el-option v-for="cat in categories" :key="cat.id" :value="cat.id" :label="cat.name" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="数量">
          <template #default="scope">
            <el-input v-model="batchItems[scope.$index].quantity" type="number" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="danger" @click="removeBatchItem(scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-form-item label="操作人">
        <el-input v-model="batchOperator" />
      </el-form-item>
      <template #footer>
        <el-button @click="batchModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'

const inventory = ref([])
const categories = ref([])
const singleModalVisible = ref(false)
const batchModalVisible = ref(false)
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const batchOperator = ref('')

const singleForm = ref({
  asset_code: '',
  quantity: 1,
  operator: '',
  remark: ''
})

const batchItems = ref([{ name: '', category_id: 0, quantity: 1 }])

const loadInventory = async () => {
  const res = await request.get('/inventory', { params: { page: page.value, limit: limit.value } })
  if (res.success) {
    inventory.value = res.data
    total.value = res.total
  }
}

const loadCategories = async () => {
  const res = await request.get('/category')
  if (res.success) {
    categories.value = res.data
  }
}

const openSingleModal = () => {
  singleForm.value = { asset_code: '', quantity: 1, operator: '', remark: '' }
  singleModalVisible.value = true
}

const openBatchModal = () => {
  batchItems.value = [{ name: '', category_id: 0, quantity: 1 }]
  batchOperator.value = ''
  batchModalVisible.value = true
}

const handleSingleSubmit = async () => {
  if (!singleForm.value.asset_code) {
    alert('请输入资产编号')
    return
  }
  const res = await request.post('/inventory/in', singleForm.value)
  if (res.success) {
    alert('入库成功')
    singleModalVisible.value = false
    loadInventory()
  } else {
    alert(res.message)
  }
}

const addBatchItem = () => {
  batchItems.value.push({ name: '', category_id: 0, quantity: 1 })
}

const removeBatchItem = (index) => {
  batchItems.value.splice(index, 1)
}

const handleBatchSubmit = async () => {
  const validItems = batchItems.value.filter(item => item.name)
  if (validItems.length === 0) {
    alert('请填写资产信息')
    return
  }
  const res = await request.post('/inventory/batch', { items: validItems, operator: batchOperator.value })
  if (res.success) {
    alert('批量入库成功')
    batchModalVisible.value = false
    loadInventory()
  } else {
    alert(res.message)
  }
}

const formatType = (row) => {
  return row.type === 'in' ? '入库' : row.type
}

const handleSizeChange = (val) => {
  limit.value = val
  loadInventory()
}

const handleCurrentChange = (val) => {
  page.value = val
  loadInventory()
}

onMounted(() => {
  loadInventory()
  loadCategories()
})
</script>