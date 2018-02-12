import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import Dashboard from '@/views/Dashboard'
import Appointments from '@/views/Appointments'
import store from '@/store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/dash',
      name: 'dash',
      component: Dashboard
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: Appointments
    }
  ]
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.auth.isAuthenticated;

  if (!isAuthenticated && to.path !== '/') {
    next('/?redirect=' + to.path)
  }
  else if (isAuthenticated && to.path === '/') {
    next('/dash')
  }
  else {
    next()
  }


})

export default router
