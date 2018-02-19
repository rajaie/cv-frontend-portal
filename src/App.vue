<template>
  <div id="app">
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

  export default {
    name: 'App',
    components: {
      TopBar,
      SideBar
    },
    data() {
      return {
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
        background: #fbfbfb;
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
