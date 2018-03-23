<template>
  <div class="container">
    <div class="login">
      <div class="login-form">
        <div class="logo">
          <img src="../assets/logo.png">
        </div>
        <div class="field">
          <p class="control has-icons-left">
            <input class="input" v-model="username" placeholder="Username">
            <span class="icon is-small is-left">
              <i class="fas fa-user-circle"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control has-icons-left">
            <input class="input" v-model="password" type="password" placeholder="Password">
            <span class="icon is-small is-left">
              <i class="fas fa-lock"></i>
            </span>
          </p>
        </div>
        <div class="field">
          <p class="control has-text-centered">
            <button @click="login" class="button is-success">
              Login
            </button>
          </p>
        </div>
        <div v-if="error" class="has-text-danger">{{ error }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import ApiService from '@/services/ApiService'

  // TODO: Grab Clinic object when user logs in and store it in localStorage


  export default {
    name: 'Login',
    data() {
      return {
        password: "",
        username: "practitioner_1_0",
        user: undefined,
        patients: undefined,
        error: undefined,
      }
    },
    computed: {
    },
    methods: {
      async loginSuccessful(req) {
        let self = this;

        console.log(req.data.message);
        this.$store.commit("login", req.data.result.token);

        // Initialize token for ApiService here, since it was initially 'null' when the component first loaded
        ApiService.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`

        this.$store.dispatch("getProfile");
        this.$store.dispatch("getClinic");
        this.$router.replace(this.$route.query.redirect || '/dash')
      },
      loginFailed(err) {
        let self = this;

        this.$store.commit("logout");
        if (err.response && err.response.headers) {
          self.error = err.response.data.message
        }
        else {
          self.error = "Temporary server error, please try again"
        }
      },
      login() {
        let self = this;

        ApiService.post('/login', {
          username: self.username,
          password: self.password
        })
          .then(function (req) {
            self.loginSuccessful(req)
          })
          .catch(function (err) {
            self.loginFailed(err)
        })
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .login {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    height: 70vh;
    .login-form {
      width: 230px;
    },
    .logo {
      width: 100%;
      padding: 0 12px 20px 0;
      text-align: center;
      img {
        width: 200px;
      }
    }
  }
</style>
