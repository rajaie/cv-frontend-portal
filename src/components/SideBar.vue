<template>
  <div class="side-bar">
    <aside class="menu">
      <ul class="menu-list">
        <li v-for="(link, index) in mainMenuLinks" :key="index">
          <router-link :to="link.linkUrl" active-class="is-active">
            <i :class="['fas', 'fa', 'fa-fw', 'fa-'+link.icon]"></i>
            <span class="menu-item-right">{{ link.linkText }}</span>
          </router-link>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script>
  import { mainMenuLinks } from '@/shared/navigation'

  export default {
    name: "side-bar",
    data() {
      return {
        mainMenuLinks: mainMenuLinks
      }
    },
  }
</script>

<style lang="scss" scoped>
  #app {
    .wrapper {
      .side-bar {
        background: #cae8fb;
        height: 100%;
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;

        aside.menu {
          span.menu-item-right {
            margin-left: 10px;
          }
          .menu-list a {
            padding: 0.75em 1.75em;
            &.is-active {
              color: black;
              background: white;
            }
          }
        }
      }
    }
  }
</style>
