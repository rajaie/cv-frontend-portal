<template>
  <div>
    <div class="container is-fluid">
      <h1 class="title">Settings</h1>
      <div class="main">
        <!-- Type -->
        <nav class="panel column is-3 notifications">
          <p class="panel-heading">
            Notifications
          </p>
          <div class="panel-block settings-subheader">
            <h3 class="is-4">Type</h3>
              <b-tooltip label="How would you like us to notify you?"
                         position="is-right">
                  <span class="icon"><i class="fas fa-info-circle"></i></span>
              </b-tooltip>
          </div>
          <label class="panel-block settings-option">
            <input type="checkbox" v-model="userSettings.emailNotifications">
            Email
          </label>
          <label class="panel-block settings-option">
            <input v-model="userSettings.smsNotifications" type="checkbox">
            SMS
          </label>
          <!-- Events -->
          <div class="panel-block settings-subheader">
            <h3 class="is-4">Events</h3>
              <b-tooltip label="What would you like to be notified of?"
                         position="is-right">
                  <span class="icon"><i class="fas fa-info-circle"></i></span>
              </b-tooltip>
          </div>
          <label class="panel-block settings-option">
            <input v-model="userSettings.newAppointmentNotifications" type="checkbox">
            New Appointments
          </label>
          <label class="panel-block settings-option">
            <input v-model="userSettings.rescheduledAppointmentNotifications" type="checkbox">
            Re-scheduled Appointments
          </label>
          <label class="panel-block settings-option">
            <input v-model="userSettings.cancelledAppointmentNotifications" type="checkbox">
            Cancelled Appointments
          </label>
          <label class="panel-block settings-option">
            <input v-model="userSettings.appointmentReminderNotifications" type="checkbox">
            Appointment Reminders
            <b-tooltip label="Get an appointment reminder 24 hours before your appointment"
                       position="is-right">
              <span class="icon"><i class="fas fa-info-circle"></i></span>
            </b-tooltip>
          </label>
          <div class="panel-block">
            <button @click="updateSettings" class="button is-link is-outlined is-fullwidth">
              update settings
            </button>
            <button @click="resetSettings" class="button is-text">
              cancel
            </button>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
  import ApiService from '@/services/ApiService'

  export default {
    name: 'Appointments',
    data() {
      return {
        userSettings: {},
        userSettingsCopy: {}
      }
    },
    computed: {
    },
    async created() {
      try {
        const res = await ApiService.get('/user/settings')
        this.userSettings = Object.assign({}, res.data.result)
        this.userSettingsCopy = Object.assign({}, res.data.result)
      }
      catch(err) {
        console.log(err)
      }
    },
    methods: {
      async updateSettings() {
        try {
          const res = await ApiService.patch('/user/settings', this.userSettings)
          this.userSettings = Object.assign({}, res.data.result)
          this.userSettingsCopy = Object.assign({}, res.data.result)

          this.$toast.open({
            message: 'Your preferences have been updated successfully!',
            type: 'is-success',
            duration: 3000
          })
        }
        catch(err) {
          console.log(err)
        }
      },
      resetSettings() {
        this.userSettings = Object.assign({}, this.userSettingsCopy)
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .container {
    padding-top: 20px;
    .main {
      margin-top: 1rem;
    }

    .panel-heading {
      background: #e5ffe2;
    }
    .settings-subheader {
      background: whitesmoke;
    }
    .settings-option {
      padding-left: 2rem;
    }
  }
</style>
