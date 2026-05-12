import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/categories' },
  { path: '/categories', component: () => import('../views/CategoryList.vue') },
  { path: '/assets', component: () => import('../views/AssetList.vue') },
  { path: '/inventory', component: () => import('../views/InventoryList.vue') },
  { path: '/apply', component: () => import('../views/ApplyList.vue') },
  { path: '/approval', component: () => import('../views/ApprovalList.vue') },
  { path: '/ledger', component: () => import('../views/LedgerList.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router