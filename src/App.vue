<template>
  <div id="app">
    <!--Show the router-view (login component) only for the root path-->
    <div class="wrapper" v-if="this.$route.path === '/'">
      <router-view></router-view>
    </div>
    <!--Otherwise, show the layout with our header/sidebar/main sections-->
    <div class="wrapper" v-else>
      <div class="top-bar">
        <div class="navbar is-fixed-top">
          <div class="navbar-brand">
            <router-link class="navbar-item" to="dash">
              <img src="./assets/logo.png" width="112" height="28">
            </router-link>
            <div @click="makeBurger" :class="['navbar-burger', { 'is-active': burgerIsActive }]" data-target="navMenu">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="navbar-menu" :class="['navbar-menu', { 'is-active': burgerIsActive }]" id="navMenu">
            <div class="navbar-end">
              <div class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link is-hidden-touch">
                  <i class="fas fa-2x fa-user-circle"></i>
                </a>
                <div class="navbar-dropdown is-right">
                  <div class="is-hidden-desktop">
                  <router-link @click.native="makeBurger"  to="/dash" class="navbar-item" active-class="is-active">Dashboard</router-link>
                  <router-link @click.native="makeBurger" to="/appointments" class="navbar-item" active-class="is-active">Appointments</router-link>
                  <a class="navbar-item">Services</a>
                  <a class="navbar-item">Availability</a>
                  <a class="navbar-item">Patients</a>
                  <a class="navbar-item">Staff</a>
                  <a class="navbar-item">SOAP Notes</a>
                  <a class="navbar-item">Intake Forms</a>
                  <a class="navbar-item">Invoices</a>
                  <hr class="navbar-divider is-block-touch">
                  </div>
                  <a class="navbar-item">Profile</a>
                  <a class="navbar-item">Settings</a>
                  <a class="navbar-item" @click="logout">Logout</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="columns is-gapless is-mobile body-columns">
        <div class="is-hidden-touch column is-narrow">
          <div class="side-bar">
            <aside class="menu">
              <ul class="menu-list">
                <li>
                  <router-link to="/dash" active-class="is-active">Dashboard</router-link>
                </li>
                <li>
                  <router-link to="/appointments" active-class="is-active">Appointments</router-link>
                </li>
                <li><a>Services</a></li>
                <li><a>Availability</a></li>
                <li><a>Patients</a></li>
                <li><a>Staff</a></li>
                <li><a>SOAP Notes</a></li>
                <li><a>Intake Forms</a></li>
                <li><a>Invoices</a></li>
              </ul>
            </aside>
          </div>
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
  import 'buefy/lib/buefy.css'

  Vue.use(Buefy)

  export default {
    name: 'App',
    data() {
      return {
        burgerIsActive: false,
      }
    },
    methods: {
      makeBurger() {
        this.burgerIsActive = !this.burgerIsActive;
      },
      logout() {
        let self = this;

        ApiService.post('/logout', {}, {
          withCredentials: true
        })
          .then(function (res) {
            self.$store.commit("logout");
            self.$router.replace('/')
            console.log(res)
          })
          .catch(function (err) {
            console.log(err)

          })
      },
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
        .navbar-burger {
        }
        a.navbar-item:hover, a.navbar-item.is-active, a.navbar-link:hover, a.navbar-link.is-active {
          background: none;
        }
      }
      .side-bar {
        background: #FFD9DA;
        height: 100%;
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;

        aside.menu {
        }
      }
      .main-container {
        background: #f2f2f2;
        height: 100%;
      }
    }
  }
</style>
