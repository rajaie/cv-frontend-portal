<template>
      <div class="top-bar">
        <div class="navbar is-fixed-top">
          <div class="navbar-brand">
            <router-link class="navbar-item" to="dash">
              <img src="@/assets/logo.png" width="112" height="28">
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
                  <!--Show our sidebar navigation links in the drop down menu on touch (mobile/tablet)-->
                  <div class="is-hidden-desktop">
                    <router-link v-for="(link, index) in mainMenuLinks"
                                 :key="index" @click.native="makeBurger"
                                 :to="link.linkUrl" class="navbar-item"
                                 active-class="is-active">
                      <i :class="['fas', 'fa', 'fa-fw', 'fa-'+link.icon]"></i> {{ link.linkText }}
                    </router-link>
                    <hr class="navbar-divider is-block-touch">
                  </div>
                  <!--Always show these links whatever the screen size-->
                  <router-link @click.native="makeBurger" to="/profile" class="navbar-item" active-class="is-active">
                    Profile
                  </router-link>
                  <router-link @click.native="makeBurger" to="/settings" class="navbar-item" active-class="is-active">
                    Settings
                  </router-link>
                  <a class="navbar-item" @click="logout">Logout</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
  import { mainMenuLinks } from '@/shared/navigation'
  import ApiService from '@/services/ApiService'

  export default {
    name: "top-bar",
    data() {
      return {
        burgerIsActive: false,
        mainMenuLinks: mainMenuLinks
      }
    },
    created() {
      let self = this;
    },
    methods: {
      makeBurger() {
        this.burgerIsActive = !this.burgerIsActive;
      },
      logout() {
        let self = this;

        const confirmedLogout = confirm("Are you sure you want to log out?");

        if (confirmedLogout) {
          self.$store.commit("logout");
          self.$router.replace('/')
        }
      },
    }
  }
</script>

<style scoped>

</style>
