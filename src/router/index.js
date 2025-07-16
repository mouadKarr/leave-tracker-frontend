// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/components/Login.vue'
import Layout from '@/components/Layout.vue'
import Home from '@/components/Home.vue'
import DemandeConge from '@/components/LeaveRequestForm.vue'
import MesDemandes from '@/components/MyLeaveRequests.vue'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'demande-conge', component: DemandeConge },
      { path: 'mes-demandes', component: MesDemandes }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' } // redirection si URL inconnue
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
