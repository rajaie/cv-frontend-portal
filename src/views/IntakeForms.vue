<template>
  <div class="container is-fluid">
    <h1 class="title">Intake Forms</h1>
    <div class="columns">
      <div class="column notes-list">
        <table class="table is-narrow is-hoverable is-fullwidth">
          <thead>
          <tr>
            <th>Patient</th>
            <th>Creation Date</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="intakeForm in intakeForms"
              @click="selectIntakeForm(intakeForm)"
              :class="['intakeForm-row', { 'is-selected': isRowSelected(intakeForm.id) }]">
            <td>{{intakeForm.patient.firstName}} {{intakeForm.patient.lastName}}</td>
            <td>{{formatDateTime(intakeForm.createdAt)}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div v-if="selectedIntakeForm" class="column is-two-fifths intakeForm-column">
        <h2 class="subtitle left-align has-text-weight-bold">
          Intake Form - {{selectedIntakeForm.patient.firstName}} {{selectedIntakeForm.patient.lastName}}
        </h2>
        <div class="right-align">
          <a @click="selectedIntakeForm=undefined;">
            <button class="fas fa-chevron-circle-right"></button>
          </a>
        </div>
        <div class="clear"></div>
        <div v-for="(section, index) in selectedIntakeForm.content.sections">
          <div v-for="sectionTitle in Object.keys(section)">
            <p><strong>{{sectionTitle}}</strong></p>
            <p>{{section[sectionTitle]}}</p>
          </div>
          <br>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ApiService from '@/services/ApiService'
  import moment from 'moment-timezone'

  export default {
    name: 'IntakeForms',
    data() {
      return {
        intakeForms: [],
        selectedIntakeForm: null,
        clinic: {},
      }
    },
    computed: {

    },
    created() {
      this.getIntakeForms();
    },
    methods: {
      isRowSelected(intakeFormId) {
        if (!this.selectedIntakeForm) {
          return false
        }

        return intakeFormId === this.selectedIntakeForm.id
      },
      selectIntakeForm(intakeForm) {
        this.selectedIntakeForm = intakeForm
      },
      async getIntakeForms() {
        try {
          const intakeForms = await ApiService.get('/intakeForm')
          this.intakeForms = intakeForms.data.result
          console.log(intakeForms.data.message)
        }
        catch (e) {
          console.log(e.data.message);
        }
      },
      formatDateTime(dateTime, timezone) {
        if (!timezone) {
          timezone = "America/Toronto"
        }
        return moment.tz(dateTime, timezone).format("ddd, MMM Do, hh:mm A")
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .container {
    padding-top: 20px;
    .intakeForm-column {
      border: 1px solid black;
      h1.title {
        margin-bottom: 0;
      }
      .appointment-info {
        margin-bottom: 1rem;
      }
      button.save {
        margin-top: 1rem;
      }
    }
    table {
      tr.intakeForm-row {
        &:hover {
          cursor: pointer;
        }
        &.is-selected {
        }
      }
      thead {
        th {
          text-align: center;
        }
      }
      tbody {
        td, th {
          text-align: center;
        }
      }
    }
  }
</style>
