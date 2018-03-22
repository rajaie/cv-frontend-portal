import jsonwebtoken from 'jsonwebtoken'
import ApiService from '@/services/ApiService'

// TODO: store user object in global store upon login

export default {
  state: {
    isAuthenticated: !!localStorage.token,
    user: localStorage.user ? JSON.parse(localStorage.user) : {},
    clinic: localStorage.clinic ? JSON.parse(localStorage.clinic) : {}
  },
  mutations: {
    login(state, token) {
      localStorage.token = token;
      state.isAuthenticated = true;

      const payload = jsonwebtoken.decode(token)
      const user = {
        id: payload.id,
        clinic: payload.clinic
      }

      localStorage.user = JSON.stringify(user)
      state.user = user;
    },
    logout(state) {
      delete localStorage.token
      delete localStorage.user

      state.isAuthenticated = false;
      state.user = {};
    },
    setUser(state, user) {
      localStorage.user = JSON.stringify(user)
      state.user = user;
    },
    setClinic(state, clinic) {
      localStorage.user = JSON.stringify(clinic)
      state.clinic = clinic;
    }
  },
  actions: {
    async getProfile({ commit, state }, userId) {
      console.log("Getting user profile")
      const res = await ApiService.get(`/user/${userId}`)
      const user = res.data.result
      commit('setUser', user)
    },
    async getClinic({ commit, state }, clinicId) {
      console.log("Getting clinic info")
      const res = await ApiService.get(`/clinic/1`)
      const clinic = res.data.result
      commit('setClinic', clinic)
    }
  }
}
