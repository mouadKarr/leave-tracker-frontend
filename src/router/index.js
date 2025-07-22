import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/components/Login.vue'
import Layout from '@/components/Layout.vue'
import Home from '@/components/Home.vue'
import DemandeConge from '@/components/LeaveRequestForm.vue'
import MesDemandes from '@/components/MyLeaveRequests.vue'
import ManagerDashboard from '@/components/ManagerDashboard.vue'
import UsersManagement from '@/components/UsersManagement.vue'

const routes = [
  { path: '/login', component: Login },
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'demande-conge', component: DemandeConge },
      { path: 'mes-demandes', component: MesDemandes },
      { 
        path: 'manager',
        component: ManagerDashboard,
        meta: { requiresRole: ['Manager', 'SuperAdmin'] }
      },
      {
        path: 'admin/users',
        component: UsersManagement,
        meta: { requiresRole: ['SuperAdmin'] }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'))
  const requiredRoles = to.meta.requiresRole

  if (requiredRoles && user) {
    if (requiredRoles.includes(user.role)) {
      next()
    } else {
      alert("⛔️ Accès refusé : vous n'avez pas le rôle requis.")
      next('/')
    }
  } else {
    next()
  }
})

export default router
