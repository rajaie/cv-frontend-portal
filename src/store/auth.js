export default {
  state: {
    isAuthenticated: !!localStorage.authenticated
  },
  mutations: {
    login (state) {
      localStorage.authenticated = 'true';
      state.isAuthenticated = true;
    },
    logout (state) {
      delete localStorage.authenticated
      state.isAuthenticated = false;
    }
  }
}
