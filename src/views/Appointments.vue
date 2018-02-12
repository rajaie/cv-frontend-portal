<template>
  <div>
      <h1 class="title">Appointments</h1>
    <router-link to="dash">Go to dash</router-link>
  </div>
</template>

<script>
  import ApiService from '@/services/ApiService'

  export default {
    name: 'Appointments',
    data() {
      return {
      }
    },
    computed: {
    },
    created() {
    },
    methods: {
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
