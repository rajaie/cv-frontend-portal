<template>
  <div class="container">
    <div class="login">
      <div>
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


  export default {
    name: 'Login',
    data() {
      return {
        password: "qq",
        username: "practitioner_1_0",
        user: undefined,
        patients: undefined,
        error: undefined,
      }
    },
    computed: {
    },
    methods: {
      loginSuccessful(req) {
        let self = this;
        console.log("Login succeeded");

        this.$store.commit("login");

        self.error = undefined;
        self.user = req.data.result;

        this.$router.replace(this.$route.query.redirect || '/dash')
      },
      loginFailed() {
        let self = this;
        console.log("Login failed");
        this.$store.commit("logout");
        self.error = "Incorrect username and password combination"
      },
      login() {
        let self = this;

        ApiService.post('/login', {
          username: self.username,
          password: self.password
        }, {
          withCredentials: true
        })
          .then(function (req) {
            self.loginSuccessful(req)
          })
          .catch(function (err) {
            self.loginFailed()
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

    .logo {
      width: 100%;
      text-align: center;
      img {
        width: 200px;
      }
    }
  }
</style>
