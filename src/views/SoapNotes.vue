<template>
  <div class="container is-fluid">
    <h1 class="title">SOAP Notes</h1>
    <div class="columns">
      <div class="column notes-list">
        <table class="table is-narrow is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Practitioner</th>
              <th>Service</th>
              <th>Patient</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="soapNote in soapNotes"
                @click="selectSoapNote(soapNote)"
                :class="['soapNote-row', { 'is-selected': isRowSelected(soapNote.id) }]">
              <td>{{formatDateTime(soapNote.appointment.startDateTime, soapNote.appointment.timezone)}}</td>
              <td>{{soapNote.appointment.practitionerName}}</td>
              <td>{{soapNote.appointment.serviceName}}</td>
              <td>{{soapNote.appointment.patientName}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="selectedSoapNote" class="column is-two-fifths soapNote-column">
        <h2 class="subtitle">SOAP Note</h2>
        <div class="has-text-right appointment-info">
          <div class="has-text-info">Appointment Details</div>
          <div><strong>Start:</strong> {{formatDateTime(selectedSoapNote.appointment.startDateTime, selectedSoapNote.appointment.timezone)}}</div>
          <div><strong>End:</strong> {{formatDateTime(selectedSoapNote.appointment.endDateTime, selectedSoapNote.appointment.timezone)}}</div>
          <div><strong>Service:</strong> {{selectedSoapNote.appointment.serviceName}}</strong></div>
          <div><strong>Patient:</strong> {{selectedSoapNote.appointment.patientName}}</strong></div>
          <div><strong>Practitioner:</strong> {{selectedSoapNote.appointment.practitionerName}}</strong></div>
        </div>
        <b-tabs type="is-boxed">
          <b-tab-item v-for="(section, index) in Object.keys(selectedSoapNote.notes.sections)"
                      :key="index"
                      :label="section">
            <div class="field">
              <div class="control">
                <textarea class="textarea"
                          v-model="selectedSoapNote.notes.sections[section]"
                          placeholder="Notes..."></textarea>
                <button @click="updateSoapNote(selectedSoapNote)"
                        class="button is-info save">Save</button>
              </div>
            </div>
          </b-tab-item>
        </b-tabs>
      </div>
    </div>
  </div>
</template>

<script>
  import ApiService from '@/services/ApiService'
  import moment from 'moment-timezone'

  export default {
    name: 'SoapNotes',
    data() {
      return {
        soapNotes: [],
        selectedSoapNote: null,
        clinic: {},
      }
    },
    computed: {

    },
    created() {
      this.getSoapNotes();
    },
    methods: {
      isRowSelected(soapNoteId) {
        if (!this.selectedSoapNote) {
          return false
        }

        return soapNoteId === this.selectedSoapNote.id
      },
      selectSoapNote(soapNote) {
        this.selectedSoapNote = soapNote
      },
      async getSoapNotes() {
        try {
          const soapNotes = await ApiService.get('/soapNotes')
          this.soapNotes = soapNotes.data.result
          console.log(soapNotes.data.message)
        }
        catch (e) {
          console.log(e.data.message);
        }
      },
      formatDateTime(dateTime, timezone) {
        return moment.tz(dateTime, timezone).format("ddd, MMM Do, hh:mm A")
      },
      async updateSoapNote(soapNote) {
        let soapNoteObj = soapNote
        const bodyParams = {
          notes: JSON.stringify(soapNoteObj.notes)
        }
        try {
          const res = await ApiService.patch(`/soapNotes/${soapNote.id}`, bodyParams)
          const note = res.data.result;
          this.$toast.open({
            message: res.data.message,
            type: 'is-success',
            duration: 2000
          })
          console.log(note)
        }
        catch (e) {
          console.log(e)
        }
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .container {
    padding-top: 20px;
    .soapNote-column {
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
      tr.soapNote-row {
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
