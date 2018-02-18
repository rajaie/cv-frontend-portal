import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login'
import Dashboard from '@/views/Dashboard'
import Appointments from '@/views/Appointments'
import Availability from '@/views/Availability'
import IntakeForms from '@/views/IntakeForms'
import Invoices from '@/views/Invoices'
import Patients from '@/views/Patients'
import Services from '@/views/Services'
import SoapNotes from '@/views/SoapNotes'
import Staff from '@/views/Staff'
import Profile from '@/views/Profile'
import Settings from '@/views/Settings'
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
    },
    {
      path: '/availability',
      name: 'availability',
      component: Availability
    },
    {
      path: '/intake-forms',
      name: 'intake-forms',
      component: IntakeForms
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: Invoices
    },
    {
      path: '/patients',
      name: 'patients',
      component: Patients
    },
    {
      path: '/services',
      name: 'services',
      component: Services
    },
    {
      path: '/soap-notes',
      name: 'soap-notes',
      component: SoapNotes
    },
    {
      path: '/staff',
      name: 'staff',
      component: Staff
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
  ]
})

router.beforeEach((to, from, next) => {
  // Make sure the user is authenticated before allowing access to any of the routes
  // other than the '/' root, which has our login form.
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
