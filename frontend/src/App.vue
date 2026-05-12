<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" style="background-color: #2a3042;">
      <div class="logo" style="padding: 20px; text-align: center; color: #fff; font-size: 18px; border-bottom: 1px solid #3a4052;">
        资产管理系统
      </div>
      <el-menu :default-active="activeMenu" class="el-menu-vertical-demo" style="background-color: #2a3042; color: #fff;" router>
        <el-menu-item index="/categories">
          <el-icon><Folder /></el-icon>
          <span>资产分类</span>
        </el-menu-item>
        <el-menu-item index="/assets">
          <el-icon><Box /></el-icon>
          <span>资产档案</span>
        </el-menu-item>
        <el-menu-item index="/inventory">
          <el-icon><Briefcase /></el-icon>
          <span>入库管理</span>
        </el-menu-item>
        <el-menu-item index="/apply">
          <el-icon><Edit /></el-icon>
          <span>领用申请</span>
        </el-menu-item>
        <el-menu-item index="/approval">
          <el-icon><Check /></el-icon>
          <span>审批管理</span>
        </el-menu-item>
        <el-menu-item index="/ledger">
          <el-icon><Files /></el-icon>
          <span>台账记录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header style="background-color: #fff; border-bottom: 1px solid #e8e8e8; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 18px; font-weight: bold;">{{ pageTitle }}</span>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span>管理员</span>
        </div>
      </el-header>
      <el-main>
        <router-view @update:title="updateTitle" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Folder, Box, Briefcase, Edit, Check, Files } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const pageTitle = ref('资产分类')

const activeMenu = computed(() => route.path)

const updateTitle = (title) => {
  pageTitle.value = title
}
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>