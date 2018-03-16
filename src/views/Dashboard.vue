<template>
  <div><div class="container is-fluid">
    <h1 class="title">Hi, {{ user.firstName }}.</h1>
    <article class="message">
      <div class="message-header">
        <p>Upcoming Appointments</p>
      </div>
      <div class="message-body">
        <ol>
          <li v-for="apt in formattedAppointments">
            {{ apt.startDateTime }} to {{ apt.endDateTime }}, {{ apt.duration }} minutes {{ apt.serviceName }} with {{ apt.patientName }}
          </li>
        </ol>
      </div>
    </article>
    <article class="message">
      <div class="message-header">
        <p>Upcoming Breaks</p>
      </div>
      <div class="message-body">
        <ol>
          <li v-for="booking in formattedBreaks">
            {{ booking.duration }} minutes on {{ booking.startDateTime }} to {{ booking.endDateTime }}
          </li>
        </ol>
      </div>

    </article>
  </div></div>
</template>

<script>
  import ApiService from '@/services/ApiService'
  import moment from 'moment-timezone'
  import { mapState } from 'vuex'

  export default {
    name: 'Dashboard',
    data() {
      return {
        appointments: [],
        breaks: [],
      }
    },
    computed: {
      formattedAppointments() {
          const apts = JSON.parse(JSON.stringify(this.appointments));
          apts.forEach(function(apt) {
            const duration = moment(apt.endDateTime).diff(moment(apt.startDateTime), 'minutes');
            apt.duration = duration;
            apt.startDateTime = moment.tz(apt.startDateTime, apt.timezone).format('dddd, MMMM Do, hh:mm A');
            apt.endDateTime = moment.tz(apt.endDateTime, apt.timezone).format('hh:mm A');
          })
          return apts
      },
      formattedBreaks() {
          const apts = JSON.parse(JSON.stringify(this.breaks));
          apts.forEach(function(apt) {
            const duration = moment(apt.endDateTime).diff(moment(apt.startDateTime), 'minutes');
            apt.duration = duration;
            apt.startDateTime = moment.tz(apt.startDateTime, apt.timezone).format('dddd, MMMM Do, hh:mm A');
            apt.endDateTime = moment.tz(apt.endDateTime, apt.timezone).format('hh:mm A');
          })
          return apts
      },
      ...mapState({
        user: state => state.auth.user,
      })
    },
    created() {
      this.getAppointments()
      this.getBreaks()
    },
    methods: {
      getAppointments() {
        let self = this;
        const now = moment.utc().format("YYYY-MM-DD HH:mm:ss")

        ApiService.get('/appointment', {
          params: {
            populate: "false",
            where: {
              startDateTime: {
                '>=': now
              },
              status: [1, 2],
              practitioner: this.$store.state.auth.user.id
            },
            sort: 'startDateTime ASC',
            limit: 100
          },
          withCredentials: true
        }
          )
          .then(res => self.appointments = res.data.result)
          .catch(err => console.log(err))
      },
      getBreaks() {
        let self = this;
        const now = moment.utc().format("YYYY-MM-DD HH:mm:ss")

        ApiService.get('/appointment', {
          params: {
            populate: "false",
            where: {
              startDateTime: {
                '>=': now,
              },
              status: 0,
              practitioner: this.$store.state.auth.user.id
            },
            sort: 'startDateTime ASC',
            limit: 100
          },
          withCredentials: true
        }
          )
          .then(res => self.breaks = res.data.result)
          .catch(err => console.log(err))
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .container {
    padding-top: 20px;
  }
</style>
