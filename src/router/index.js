import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/components/Login.vue'
import DemandeConge from '@/components/LeaveRequestForm.vue'
import MesDemandes from '@/components/MyLeaveRequests.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/demande-conge', component: DemandeConge },
  { path: '/mes-demandes', component: MesDemandes }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
