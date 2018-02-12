<template>
  <div>
    <h1 class="title">Dashboard</h1>
    <ul>
    <li v-for="patient in patients">{{ patient.id }} - {{ patient.firstName }} {{ patient.lastName }}</li>
    </ul>
    <router-link to="appointments">Go to appointments</router-link>
  </div>
</template>

<script>
  import ApiService from '@/services/ApiService'
  import { mapState } from 'vuex'

  export default {
    name: 'Dashboard',
    data() {
      return {
        patients: undefined,
      }
    },
    computed: {
    },
    created() {
      this.getPatients()
    },
    methods: {
      getPatients() {
        let self = this;
        ApiService.get('/patient', {withCredentials: true})
          .then(res => self.patients = res.data.result)
          .catch(err => console.log(err))
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
