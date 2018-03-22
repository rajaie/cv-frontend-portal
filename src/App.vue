<template>
  <div id="app">
    <span class="is-hidden">{{ gitHash }}</span>
    <!--Show the router-view (login component) only for the root path-->
    <div class="wrapper" v-if="this.$route.path === '/'">
      <router-view></router-view>
    </div>
    <!--Otherwise, show the layout with our header/sidebar/main sections-->
    <div class="wrapper" v-else>
      <top-bar></top-bar>
      <div class="columns is-gapless is-mobile body-columns">
        <div class="column is-hidden-touch is-narrow">
          <side-bar></side-bar>
        </div>
        <div class="column">
          <div class="main-container">
            <router-view/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'
  import Buefy from 'buefy'
  import ApiService from '@/services/ApiService'
  import TopBar from '@/components/TopBar'
  import SideBar from '@/components/SideBar'
  import 'buefy/lib/buefy.css'

  Vue.use(Buefy)
  window.jQuery = window.$ = require('jquery')

  export default {
    name: 'App',
    components: {
      TopBar,
      SideBar
    },
    async created() {
      let self = this;

      // Check that the user, and log them out if not.
      // This is in case we force logout a user on the backend side.
      function checkLogin() {
        // TODO: use interceptor instead of this ghetto method
        if (self.$store.state.auth.isAuthenticated) {
          console.log("Check authentication status...")
          ApiService.get('/user/authenticated').then()
            .catch(function (err) {
              console.log(err.response)
              if (err.response && [403, 401].includes(err.response.status)) {
                self.$store.commit("logout");
                self.$router.replace('/')
              }
            })
        }
      }

      // Get profile to store it in local storage
      if (this.$store.state.auth.isAuthenticated) {
        this.$store.dispatch("getProfile", this.$store.state.auth.user.id);
        this.$store.dispatch("getClinic", this.$store.state.auth.user.clinic);
      }

      setInterval(checkLogin, 60000)
    },
    data() {
      return {
        gitHash: process.env.COMMIT_HASH
      }
    },
    methods: {
    },
  }
</script>

<style lang="scss">
  #app {
    .wrapper {

      .columns.is-gapless:not(:last-child) {
        margin-bottom: 0;
      }
      .body-columns {
        min-height: 100vh;
      }
      .top-bar {
        .navbar {
          border-bottom: 1px solid #e0e0e0;
        }
        a.navbar-item:hover, a.navbar-item.is-active, a.navbar-link:hover, a.navbar-link.is-active {
          background: none;
        }
      }
      .main-container {
        background: #ffffff;
        height: 100%;
      }
    }
  }
  .left-align {
    float: left;
  }
  .right-align {
    float: right;
  }
  .clear {
    clear: both;
  }
</style>
