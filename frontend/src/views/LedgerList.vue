<template>
  <div>
    <el-button type="primary" @click="openReturnModal">资产归还</el-button>
    <el-button type="success" @click="openTransferModal">资产调拨</el-button>
    <el-button type="danger" @click="openScrapModal">资产报废</el-button>
    
    <el-input v-model="keyword" placeholder="搜索资产编号" style="width: 300px; margin-left: 10px;" @keyup.enter="loadLedger" />
    <el-select v-model="typeFilter" placeholder="选择类型" style="width: 150px; margin-left: 10px;" @change="loadLedger">
      <el-option :value="''" label="全部" />
      <el-option value="入库" label="入库" />
      <el-option value="领用" label="领用" />
      <el-option value="归还" label="归还" />
      <el-option value="调拨" label="调拨" />
      <el-option value="报废" label="报废" />
    </el-select>

    <el-table :data="ledger" style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="asset_code" label="资产编号" />
      <el-table-column prop="asset_name" label="资产名称" />
      <el-table-column prop="type" label="操作类型" />
      <el-table-column prop="quantity" label="数量" />
      <el-table-column prop="operator" label="操作人" />
      <el-table-column prop="related_no" label="关联单号" />
      <el-table-column prop="remark" label="备注" />
      <el-table-column prop="created_at" label="操作时间" />
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page" :page-sizes="[10, 20, 50]" :page-size="limit" :total="total" layout="total, sizes, prev, pager, next, jumper" />

    <el-dialog title="资产归还" :visible.sync="returnModalVisible" width="400px">
      <el-form :model="returnForm" label-width="80px">
        <el-form-item label="资产编号">
          <el-input v-model="returnForm.asset_code" />
        </el-form-item>
        <el-form-item label="归还数量">
          <el-input v-model="returnForm.quantity" type="number" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="returnForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="returnForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReturn">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="资产调拨" :visible.sync="transferModalVisible" width="400px">
      <el-form :model="transferForm" label-width="80px">
        <el-form-item label="资产编号">
          <el-input v-model="transferForm.asset_code" />
        </el-form-item>
        <el-form-item label="调拨数量">
          <el-input v-model="transferForm.quantity" type="number" />
        </el-form-item>
        <el-form-item label="新存放地点">
          <el-input v-model="transferForm.location" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="transferForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="transferForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTransfer">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="资产报废" :visible.sync="scrapModalVisible" width="400px">
      <el-form :model="scrapForm" label-width="80px">
        <el-form-item label="资产编号">
          <el-input v-model="scrapForm.asset_code" />
        </el-form-item>
        <el-form-item label="报废数量">
          <el-input v-model="scrapForm.quantity" type="number" />
        </el-form-item>
        <el-form-item label="操作人">
          <el-input v-model="scrapForm.operator" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="scrapForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scrapModalVisible = false">取消</el-button>
        <el-button type="danger" @click="handleScrap">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'

const ledger = ref([])
const returnModalVisible = ref(false)
const transferModalVisible = ref(false)
const scrapModalVisible = ref(false)
const keyword = ref('')
const typeFilter = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const returnForm = ref({ asset_code: '', quantity: 1, operator: '', remark: '' })
const transferForm = ref({ asset_code: '', quantity: 1, location: '', operator: '', remark: '' })
const scrapForm = ref({ asset_code: '', quantity: 1, operator: '', remark: '' })

const loadLedger = async () => {
  const res = await request.get('/ledger', {
    params: { page: page.value, limit: limit.value, asset_code: keyword.value, type: typeFilter.value }
  })
  if (res.success) {
    ledger.value = res.data
    total.value = res.total
  }
}

const openReturnModal = () => {
  returnForm.value = { asset_code: '', quantity: 1, operator: '', remark: '' }
  returnModalVisible.value = true
}

const openTransferModal = () => {
  transferForm.value = { asset_code: '', quantity: 1, location: '', operator: '', remark: '' }
  transferModalVisible.value = true
}

const openScrapModal = () => {
  scrapForm.value = { asset_code: '', quantity: 1, operator: '', remark: '' }
  scrapModalVisible.value = true
}

const handleReturn = async () => {
  if (!returnForm.value.asset_code) {
    alert('请输入资产编号')
    return
  }
  const res = await request.post('/ledger/return', returnForm.value)
  if (res.success) {
    alert('归还成功')
    returnModalVisible.value = false
    loadLedger()
  } else {
    alert(res.message)
  }
}

const handleTransfer = async () => {
  if (!transferForm.value.asset_code || !transferForm.value.location) {
    alert('请输入资产编号和新存放地点')
    return
  }
  const res = await request.post('/ledger/transfer', transferForm.value)
  if (res.success) {
    alert('调拨成功')
    transferModalVisible.value = false
    loadLedger()
  } else {
    alert(res.message)
  }
}

const handleScrap = async () => {
  if (!scrapForm.value.asset_code) {
    alert('请输入资产编号')
    return
  }
  const res = await request.post('/ledger/scrap', scrapForm.value)
  if (res.success) {
    alert('报废成功')
    scrapModalVisible.value = false
    loadLedger()
  } else {
    alert(res.message)
  }
}

const handleSizeChange = (val) => {
  limit.value = val
  loadLedger()
}

const handleCurrentChange = (val) => {
  page.value = val
  loadLedger()
}

onMounted(() => {
  loadLedger()
})
</script>