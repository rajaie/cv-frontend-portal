// TODO: store user object in global store upon login

export default {
  state: {
    isAuthenticated: !!localStorage.authenticated,
    user: localStorage.user ? JSON.parse(localStorage.user) : {}
  },
  mutations: {
    login (state, user) {
      localStorage.authenticated = 'true';
      state.isAuthenticated = true;

      localStorage.user = JSON.stringify(user)
      state.user = user;
    },
    logout (state) {
      delete localStorage.authenticated
      state.isAuthenticated = false;

      delete localStorage.user
      state.user = {};
    }
  }
}
