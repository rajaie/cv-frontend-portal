<template>
  <div><div class="container is-fluid">
    <h1 class="title">
      Appointments
      <a @click="startAppointmentDraft" title='Create a new appointment'>
        <button class="fas fa-plus-circle fa-xs"></button>
      </a>
    </h1>
    <div class="columns is-multiline">
      <div class="column">
        <full-calendar ref="calendar"
                       :event-sources="eventSources"
                       :header="calendarOptions.header"
                       :config="calendarOptions.config">
        </full-calendar>
      </div>
      <!-- **********************************************************
           ******************* SOAP NOTES SECTION *******************
           ********************************************************** -->
      <div v-if="selectedAppointment && selectedAppointment.soapNotes && selectedAppointment.soapNotes.length"
           class="column is-4-widescreen is-full-touch is-full-desktop soap-note">
        <h2 class="subtitle">SOAP Note</h2>
        <b-tabs type="is-boxed">
          <b-tab-item v-for="(section, index) in Object.keys(selectedAppointment.soapNotes[0].notes.sections)"
                      :key="index"
                      :label="section">
            <div class="field">
              <div class="control">
                <textarea class="textarea"
                          v-model="selectedAppointment.soapNotes[0].notes.sections[section]"
                          placeholder="Notes..."></textarea>
                <button @click="updateSoapNote(selectedAppointment.soapNotes[0])"
                        class="button is-info save">Save</button>
              </div>
            </div>
          </b-tab-item>
        </b-tabs>
      </div>
      <!-- **********************************************************
           *************** APPOINTMENT DETAILS SECTION **************
           ********************************************************** -->
      <div v-if="selectedAppointment" class="column is-2-widescreen is-full-touch is-full-desktop">
        <h2 class="subtitle left-align">Appointment Details</h2>
        <a @click="selectedAppointment=undefined" class="right-align"><i class="fas fa-chevron-circle-right"></i></a>
        <div class="clear"></div>
        <div class="appointment-details-content">
          <p><span class="appointment-field">Start:</span>  {{selectedAppointment.startDateTime.format('ddd, MMM Do, hh:mm A') }}</p>
          <p><span class="appointment-field">End:</span>  {{selectedAppointment.endDateTime.format('ddd, MMM Do, hh:mm A')}}</p>
          <p><span class="appointment-field">Patient:</span> {{selectedAppointment.patientName}}</p>
          <p><span class="appointment-field">Service:</span>  {{selectedAppointment.serviceName}}</p>
          <p><span class="appointment-field">Practitioner:</span>  {{selectedAppointment.practitionerName}}</p>
        </div>
        <div class="field has-text-centered appointment-buttons">
          <button v-if="!selectedAppointment.invoice || !selectedAppointment.invoice.length" @click="createInvoice(selectedAppointment)" class="button is-primary">
            Create Invoice
          </button>
          <button v-if="!selectedAppointment.soapNotes || !selectedAppointment.soapNotes.length" @click="createSoapNote(selectedAppointment)" class="button is-primary">
            Create SOAP Note
          </button>
          <button v-if="selectedAppointment.isBookingCancellable" @click="cancelAppointment(selectedAppointment)" class="button is-danger">
            Cancel Booking
          </button>
        </div>
        <div class="invoice-details" v-if="selectedAppointment.invoice && selectedAppointment.invoice.length">
          <h2 class="subtitle">Invoice Details</h2>
          <div>
            <p><span class="appointment-field">Invoice No:</span> #{{selectedAppointment.invoice[0].id}}</p>
            <p><span class="appointment-field">Total:</span> ${{selectedAppointment.invoice[0].total}}</p>
            <p><span class="appointment-field">Billed To:</span> {{selectedAppointment.patientName}}</p>
          </div>
        </div>
      </div>
      <div v-if="serviceBooking" class="column is-2">
        <!-- **********************************************************
             ****************** BOOK A SERVICE SECTION **************
             ********************************************************** -->
        <div class="service-booking">
              <h2 class="subtitle left-align">New Appointment</h2>
              <a @click="serviceBooking=undefined" class="right-align"><i class="fas fa-chevron-circle-right"></i></a>
              <div class="clear"></div>
              <div class="appointment-details-content">
                <b-field label="Service">
                  <b-autocomplete rounded
                    v-model="serviceBooking.serviceName"
                    :data="filteredServices"
                    :open-on-focus="true"
                    field="name"
                    icon-pack="fa"
                    placeholder="e.g. Massage"
                    icon="search"
                    @select="selectService">
                    <template slot="empty">No results found</template>
                  </b-autocomplete>
                </b-field>
                <b-field label="Date">
                  <b-datepicker
                    placeholder="Click to select..."
                    icon="calendar-alt"
                    icon-pack="fa"
                    v-model="serviceBooking.date"
                    :min-date="datePickerOptions.minDate"
                    :date-formatter="datePickerOptions.dateFormatter"
                    :first-day-of-week=1
                    position="is-bottom-left">
                  </b-datepicker>
                </b-field>
                <b-field label="Start Time">
                  <b-select placeholder="Select a time"
                            :disabled="serviceBooking.date === undefined || serviceBooking.service === undefined"
                            v-model="serviceBooking.time">
                    <option v-for="time in availableSlots"
                            :value="time">
                      {{ time }}
                    </option>
                  </b-select>
                </b-field>

                <b-field label="Patient">
                  <b-autocomplete
                    rounded
                    v-model="serviceBooking.patientName"
                    :data="filteredPatients"
                    :open-on-focus="true"
                    field="fullName"
                    icon-pack="fa"
                    placeholder="e.g. John Doe"
                    icon="search"
                    @select="patient => serviceBooking.patient = patient">
                    <template slot="empty">No results found</template>
                  </b-autocomplete>
                </b-field>
              </div>
              <div class="field has-text-centered appointment-buttons">
                <a @click="createAppointment(serviceBooking)" class="button is-info">
                  Create
                </a>
              </div>
              <div class="has-text-danger has-text-centered" v-for="error in serviceBooking.errors">
                {{ error }}
              </div>
        </div><!-- /serviceBooking -->
        <!-- **********************************************************
             ****************** BOOK A BREAK SECTION **************
             ********************************************************** -->
        <div class="break-booking">
          <h2 class="subtitle">Book Time Off</h2>
          <div class="appointment-details-content">
            <b-field label="Duration">
              <b-select placeholder="Select a duration"
                        v-model="breakBooking.duration">
                <option v-for="duration in breakDurations"
                        :value="duration.length">
                  {{ duration.description }}
                </option>
              </b-select>
            </b-field>
            <b-field label="Date">
              <b-datepicker
                placeholder="Click to select..."
                icon="calendar-alt"
                icon-pack="fa"
                v-model="breakBooking.date"
                :min-date="datePickerOptions.minDate"
                :date-formatter="datePickerOptions.dateFormatter"
                :first-day-of-week=1
                position="is-bottom-left">
              </b-datepicker>
            </b-field>
            <b-field label="Start Time">
              <b-select placeholder="Select a time"
                        :disabled="!breakBooking.date || !breakBooking.duration"
                        v-model="breakBooking.time">
                <option v-for="time in availableBreakSlots"
                        :value="time">
                  {{ time }}
                </option>
              </b-select>
            </b-field>
          </div>
          <div class="field has-text-centered appointment-buttons">
            <a @click="createBreak(breakBooking)" class="button is-info">
              Book It!
            </a>
          </div>
          <div class="has-text-danger has-text-centered" v-for="error in breakBooking.errors">
            {{ error }}
          </div>
        </div><!-- /breakBooking -->
      </div><!-- /serviceBooking -->
    </div>
  </div></div>
</template>

<script>
  import ApiService from '@/services/ApiService'
  import moment from 'moment-timezone'
  import { FullCalendar } from 'vue-full-calendar'

  // TODO: for the new appointment date picker, set unselectable-days-of-week (https://buefy.github.io/#/documentation/datepicker) to the days where the practitioner is not working
  // TODO: allow booking appointments for another practitioner
  // TODO: allow rescheduling for appointment. Right now practitioner must delete appt then re-create the new one.
  // TODO: add button near Patient search box to allow creating a new patient
  // TODO: add button to delete SOAP note
  // TODO: hide appointment cancellation button if an invoice or SOAP note has been created for that appointment, since trying to delete the appt will cause a foreign key error on the backend

  export default {
    name: 'Appointments',
    components: {
      FullCalendar,
    },
    data() {
      let self = this;
      return {
        services: null,
        patients: null,
        soapNoteTemplate: null,
        serviceBooking: null,
        breakBooking: {
          duration: null,
          date: null,
          errors: null,
          time: null,
        },
        selectedAppointment: null,
        isModalActive: false,
        availableSlots: [],
        availableBreakSlots: [],
        calendarOptions: {
          header: {
            left: 'prev,next today',
            center: 'title',
            right:"month,agendaWeek,agendaDay,listWeek"
          },
          config: {
            nowIndicator: true,
            firstDay: 1,
            editable: false,
            selectable: false,
            // scrollTime: moment().startOf('hour').format("HH:mm:ss"),
            allDaySlot: false,
            businessHours: {
              dow: [0, 1, 2, 3, 4, 5, 6],
              start: '08:00',
              end: '20:00'
            },
            slotDuration: '00:15:00',
            minTime: '07:00:00',
            maxTime: '20:00:00',
            // Callbacks
            // event handler for when an appointment is clicked in the calendar
            eventClick(event, jsEvent, view) {
              let aptCpy = Object.assign({}, event);
              delete aptCpy.source // get rid of this, causes a circular reference error when trying to JSON.stringify
              self.selectedAppointment = aptCpy;
            }
          }
        },
      }
    },
    computed: {
      breakDurations() {
        // TODO: get practitioner's availabilities, and set max break length to their longest working day's hours.
        const CHUNK_SIZE_MINUTES = 15;
        const MAX_BREAK_LENGTH_HOURS = 1;
        const durations = [];
        for (let i = 1; (i*CHUNK_SIZE_MINUTES) <= (MAX_BREAK_LENGTH_HOURS*60); i++) {
          durations.push({
            length: i*CHUNK_SIZE_MINUTES,
            description: `${i*CHUNK_SIZE_MINUTES} minutes`
          })
        }

        return durations
      },
      filteredServices() {
        return this.services.filter((service) => {
          const serviceSearchKey = this.serviceBooking.serviceName ? this.serviceBooking.serviceName : ""
          return service.name
            .toString()
            .toLowerCase()
            .indexOf(serviceSearchKey.toLowerCase()) >= 0
        })
      },
      filteredPatients() {
        return this.formattedPatients.filter((patient) => {
          const patientSearchKey = this.serviceBooking.patientName ? this.serviceBooking.patientName : ""
          return patient.fullName
            .toString()
            .toLowerCase()
            .indexOf(patientSearchKey.toLowerCase()) >= 0
        })
      },
      formattedPatients() {
        let patients = this.patients.slice();

        patients.forEach(p => {
          p.fullName = p.firstName + " " + p.lastName;
        })

        return patients
      },
      datePickerOptions() {
        return {
          minDate: moment().subtract(1, 'days').toDate(),
          dateFormatter(date) {
            return moment(date).format('ddd, MMM Do')
          }
        }
      },
      eventSources() {
        let self = this;

        const eventSources = [
          {
            events(start, end, timezone, callback) {
              start =  start.format("YYYY-MM-DD HH:mm:ss");
              end =  end.format("YYYY-MM-DD HH:mm:ss");

              ApiService.get('/appointment', {
                  params: {
                    where: {
                      startDateTime: {
                        '>=': start
                      },
                      endDateTime: {
                        '<=': end
                      },
                      status: [1,2,0],
                      // practitioner: self.$store.state.auth.user.id,
                    },
                    sort: 'startDateTime ASC',
                    limit: 100
                  },
                  withCredentials: true
                }
              )
                .then(res => {
                  let formattedAppts = []
                  res.data.result.forEach(function(appointment) {

                    let event = {
                      title: appointment.serviceName ? appointment.serviceName : "Break",
                      start: moment.tz(appointment.startDateTime, appointment.timezone).format(),
                      end: moment.tz(appointment.endDateTime, appointment.timezone).format()
                    }

                    appointment.startDateTime = moment.tz(appointment.startDateTime, appointment.timezone),
                    appointment.endDateTime = moment.tz(appointment.endDateTime, appointment.timezone);
                    appointment.isBookingCancellable = moment.tz(appointment.startDateTime, appointment.timezone)
                      .isAfter(moment.tz(appointment.timezone))

                    event = Object.assign(event, appointment)

                    if (self.$store.state.auth.user.id !== appointment.practitioner.id) {
                      event.color = '#d7d7d7';
                    }
                    formattedAppts.push(event)
                  })
                  callback(formattedAppts)
                })
                .catch(err => console.log(err))
            },
          }
        ]

        return eventSources
      }
    },
    created() {
      this.getServices()
      this.getPatients()
      this.getSoapNoteTemplates()
    },
    watch: {
      'serviceBooking.date': function (newDate, oldDate) {
        const serviceBooking = this.serviceBooking
        console.log(newDate);
        console.log(oldDate);

        if (serviceBooking && serviceBooking.service) {
          this.findEmptySlots(moment(newDate).format('YYYY-MM-DD'));
        }
      },
      breakBooking: {
        handler: function (newBreakBooking, oldBreakBooking) {
          if (newBreakBooking && newBreakBooking.date && newBreakBooking.duration) {
            console.log("Get available break slots.")
            this.findBreakSlots(moment(newBreakBooking.date).format('YYYY-MM-DD'));
          }
        },
        deep: true
      }
    },
    methods: {
      selectService(service) {
        if(!service) return

        this.serviceBooking.service = service
        if (this.serviceBooking.date) {
          this.findEmptySlots(moment(this.serviceBooking.date).format('YYYY-MM-DD'));
        }
      },
      async updateSoapNote(soapNote) {
        const bodyParams = {
          notes: JSON.stringify(soapNote.notes)
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
          this.$refs.calendar.$emit('refetch-events')
        }
        catch (e) {
          console.log(e)
        }
      },
      async getSoapNoteTemplates() {
        try {
          const soapNoteTemplate = await ApiService.get('/soapNoteTemplate')
          this.soapNoteTemplate = soapNoteTemplate.data.result[0].template
          console.log(soapNoteTemplate.data.message)
        }
        catch (e) {
          console.log(e.data.message);
        }
      },
      getServices() {
        let self = this;
        ApiService.get('/service', {
          withCredentials: true
        }).then(res => self.services = res.data.result)
          .catch(err => console.log(err))
      },
      getPatients() {
        let self = this;
        ApiService.get('/patient', {
          withCredentials: true
        }).then(res => self.patients = res.data.result)
          .catch(err => console.log(err))
      },
      startAppointmentDraft() {
        console.log("Starting new draft appointment")
        this.serviceBooking = {}
      },
      async createBreak(booking) {
        console.log("Booking break;")
        let self = this;

        if (!self.breakBooking.duration || !self.breakBooking.date ||
          !self.breakBooking.time) {
          // Do this because of Vue reactivity caveats
          // https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties
          self.breakBooking = Object.assign({
            errors: ["Please fill in all the fields."]
          }, self.breakBooking)
          return
        }


        const startDate = moment(self.breakBooking.date).format("YYYY-MM-DD");
        const startTime = self.breakBooking.time;
        const startDateTime = `${startDate} ${startTime}`

        let bodyParams = {
          duration: self.breakBooking.duration,
          practitionerId: self.$store.state.auth.user.id,
          startDateTime: startDateTime,
          status: 0,
        };

        ApiService.post(`/appointment`, bodyParams, {
          withCredentials: true
        }).then(function (response) {
          console.log(response.data.message);
          self.serviceBooking = null
          // TODO: create function which returns an initialBreakData()
          self.breakBooking = {
            duration: null,
            date: null,
            errors: null,
            time: null,
          };

          let appointment = response.data.result;
          appointment.startDateTime = moment.tz(appointment.startDateTime, appointment.timezone)
          appointment.endDateTime = moment.tz(appointment.endDateTime, appointment.timezone);
          self.selectedAppointment = appointment;

          self.$toast.open({
            message: 'Break booked successfully',
            type: 'is-success',
            duration: 2000
          })
          self.$refs.calendar.$emit('refetch-events')
        }).catch(function (reason) {
          console.log(reason);
        })
      },
      async createInvoice(appointment) {
        const invoiceParams = {
          appointmentId: this.selectedAppointment.id
        }
        try {
          const res = await ApiService.post("/invoice", invoiceParams, {})
          const invoice = res.data.result;
          this.$toast.open({
            message: res.data.message,
            type: 'is-success',
            duration: 2000
          })
          console.log(invoice)
          this.selectedAppointment.invoice = [invoice]
          this.selectedAppointment = Object.assign({}, this.selectedAppointment)
          this.$refs.calendar.$emit('refetch-events')
        }
        catch (e) {
          console.log(e)
        }
      },
      async createSoapNote(appointment) {
        let soapNoteObj = this.soapNoteTemplate.sections.reduce(function(acc, cur, i) {
          acc['sections'][cur] = "";
          return acc;
        }, {'sections': {}});
        console.log(soapNoteObj);
        const noteParams = {
          appointmentId: this.selectedAppointment.id,
          notes: JSON.stringify(soapNoteObj)
        }
        try {
          const res = await ApiService.post("/soapNotes", noteParams)
          const note = res.data.result;
          this.$toast.open({
            message: res.data.message,
            type: 'is-success',
            duration: 2000
          })
          console.log(note)
          this.selectedAppointment.soapNotes = [note]
          this.selectedAppointment = Object.assign({}, this.selectedAppointment)
          this.$refs.calendar.$emit('refetch-events')
        }
        catch (e) {
          console.log(e)
        }
      },
      async createAppointment(appointment) {
        // TODO: send email notification to patient & practitioner
        let self = this;

        if (!self.serviceBooking.service || !self.serviceBooking.patient ||
            !self.serviceBooking.time || !self.serviceBooking.date) {
          // Do this because of Vue reactivity caveats
          // https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties
          self.serviceBooking = Object.assign({
            errors: ["Please fill in all the fields."]
          }, self.serviceBooking)
          return
        }


        const startDate = moment(self.serviceBooking.date).format("YYYY-MM-DD");
        const startTime = self.serviceBooking.time;
        const startDateTime = `${startDate} ${startTime}`

        let bodyParams = {
          serviceId: self.serviceBooking.service.id,
          practitionerId: self.$store.state.auth.user.id,
          startDateTime: startDateTime,
          patientId: self.serviceBooking.patient.id
        };

        ApiService.post(`/appointment`, bodyParams).then(function (response) {
          console.log(response.data.message);
          self.serviceBooking = null

          let appointment = response.data.result;
          appointment.startDateTime = moment.tz(appointment.startDateTime, appointment.timezone)
          appointment.endDateTime = moment.tz(appointment.endDateTime, appointment.timezone);
          self.selectedAppointment = appointment;

          self.$toast.open({
            message: 'Appointment created successfully',
            type: 'is-success',
            duration: 2000
          })
          self.$refs.calendar.$emit('refetch-events')
        }).catch(function (reason) {
          console.log(reason);
        })
      },
      async cancelAppointment(appointment) {
        // TODO: use in-page popup instead of browser confirmation prompt
        // TODO: send patient an email notifying them of the cancellation
        let self = this;
        const confirmedCancel = confirm("Are you sure you want to cancel this appointment?");

        if (confirmedCancel) {
          ApiService.delete(`/appointment/${appointment.id}`, {
            withCredentials: true
          }).then(function (response) {
              console.log(response.data.message);
              self.selectedAppointment = null
              self.$toast.open({
                message: 'Appointment deleted successfully',
                type: 'is-danger',
                duration: 1500
              })
              self.$refs.calendar.$emit('refetch-events')
            }).catch(function (reason) {
              console.log(reason);
            })
        }
      },
      async findEmptySlots(date) {
        // TODO: display a disabled option if no timings available on that day
        console.log("Finding empty slots")
        const self = this;
        ApiService.get(`/findEmptySlots`, {
          params: {
            date: date,
            serviceId: self.serviceBooking.service.id,
            practitionerId: self.$store.state.auth.user.id
          },
          withCredentials: true
        })
          .then(function (response) {
            const times = response.data.result;
            self.availableSlots = times;
            console.log(response.data.message);
          })
          .catch(function (reason) {
            console.log(reason);
            self.availableSlots = []
          })
      },
      async findBreakSlots(date) {
        // TODO: display a disabled option if no timings available on that day
        console.log("Finding empty slots")
        const self = this;
        ApiService.get(`/findEmptySlots`, {
          params: {
            date: date,
            duration: self.breakBooking.duration,
            practitionerId: self.$store.state.auth.user.id
          },
          withCredentials: true
        })
          .then(function (response) {
            const times = response.data.result;
            self.availableBreakSlots = times;
            console.log(response.data.message);
          })
          .catch(function (reason) {
            console.log(reason);
            self.availableBreakSlots = []
          })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    padding-top: 20px;
  }
  .appointment-field {
    font-weight: bold;
  }
  .appointment-buttons {
    margin-top: 1rem;
    button {
      margin-bottom: .3rem;
    }
  }
  .service-booking {
    margin-bottom: 1.5rem;
  }
  div .soap-note {
    button.save {
      margin-top: 1rem;
    }
  }
</style>

<style>
  @import 'fullcalendar/dist/fullcalendar.css';
</style>
