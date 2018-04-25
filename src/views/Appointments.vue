<template>
  <div><div class="container is-fluid">
    <div class="columns is-multiline">
      <div class="column">
        <div class="practitioner-dropdown">
          <nav class="navbar fc-toolbar fc-header-toolbar">
            <div class="navbar-brand">
              <div class="navbar-item">
                <a @click="startAppointmentDraft" title='Create a new appointment'>
                  <button class="fas fa-plus-circle fa-2x"></button>
                </a>
              </div>
              <b-dropdown class="navbar-item is-left" hoverable>
                <button type="button" class="button fc-button fc-state-default fc-corner-right" slot="trigger">
                  <span>Practitioners</span>
                  <span class="icon is-small">
                    <i class="fas fa-angle-down" aria-hidden="true"></i>
                  </span>
                </button>

                <b-dropdown-item v-for="practitioner in practitioners" :key="practitioner.id">
                  <b-checkbox v-model="practitionerFilterSelect" :native-value="practitioner.id">
                    {{practitioner.firstName}} {{practitioner.lastName}}
                  </b-checkbox>
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </nav>
        </div>
          <full-calendar
            ref="calendar"
            :event-sources="eventSources"
            :header="calendarOptions.header"
            :config="calendarOptions.config"
            :style="{}"
          >
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

        <!-- form when a specific time slot was choosen (clicked) by the practitioner/user -->
        <div v-if="serviceBooking.mode=='calendarClick'">
          <h2 class="subtitle left-align">New Appointment</h2>
          <a @click="serviceBooking=undefined" class="right-align"><i class="fas fa-chevron-circle-right"></i></a>
          <div class="clear"></div>
          <div class="appointment-details-content">
            <b-field label="Service">
              <b-autocomplete rounded
                              v-model="serviceBooking.serviceName"
                              :data="serviceBooking.practitioner.services"
                              :open-on-focus="true"
                              field="name"
                              icon-pack="fa"
                              placeholder="e.g. Massage"
                              icon="search"
                              @select="selectService">
                <template slot="empty">No results found</template>
              </b-autocomplete>
            </b-field>
            <b-field label="Practitioner">
              <b-input disabled v-model="serviceBooking.practitionerName"></b-input>
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
                position="is-bottom-left"
                disabled>
              </b-datepicker>
            </b-field>
            <b-field label="Start Time">
              <b-input disabled v-model="serviceBooking.time"></b-input>
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
            <a @click="createAppointment" class="button is-info">
              Create
            </a>
          </div>
          <div class="has-text-danger has-text-centered" v-for="error in serviceBooking.errors">
            {{ error }}
          </div>
        </div><!-- /serviceBooking -->
        <div v-else>
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
            <b-field label="Practitioner">
              <b-autocomplete rounded
                              v-model="serviceBooking.practitionerName"
                              :data="filteredPractitioners"
                              :open-on-focus="true"
                              field="fullName"
                              icon-pack="fa"
                              placeholder="e.g. James Ali"
                              icon="search"
                              @select="selectPractitioner">
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
                        :disabled="serviceBooking.date === undefined || serviceBooking.practitioner === undefined"
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
            <a @click="createAppointment" class="button is-info">
              Create
            </a>
          </div>
          <div class="has-text-danger has-text-centered" v-for="error in serviceBooking.errors">
            {{ error }}
          </div>
        </div>
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

  import "fullcalendar-scheduler";
  import "fullcalendar/dist/fullcalendar.min.css";
  import "fullcalendar-scheduler/dist/scheduler.min.css";
  import config from "../config/config";
  var _  = require('underscore');
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

        practitionerFilterSelect: [],
        practitionerFilterView: true,
        services: null,
        patients: null,
        practitioners: null,
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
            right:"timelineDay,timelineWeek,month,listWeek"
          },
          config: {
            schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
            views : {
              timelineDay: {
                groupByDateAndResource: true,
              },
              timelineWeek: {
                groupByDateAndResource: true,
              }
            },
            nowIndicator: true,
            firstDay: 1,
            editable: false,
            selectable: true,
            selectHelper: true,
            selectOverlap: false,
            unselectAuto: false,
            groupByDateAndResource: false,
            defaultView: 'timelineDay',
            resourceAreaWidth: "10rem",
            height: 800,
            allDaySlot: false,
            businessHours: {
              dow: [0, 1, 2, 3, 4, 5, 6],
              start: '08:00',
              end: '23:00'
            },
            slotDuration: '00:15:00',
            minTime: '00:00:00',
            maxTime: '23:59:99',
            // Callbacks
            // color code odd and even days in the calendar
            dayRender(date, cell) {
              let numDaysSinceEpoch = date.diff(moment(0), 'days');
              if (numDaysSinceEpoch % 2 == 0) {
                cell.css("background-color", "#FDFEFE");
              }
              else {
                cell.css("background-color", "#F8FCFC");
              }
            },
            // callback for when the user clicks on a day in the month view
            dayClick(date, event, view, resource){
              if (view.name !== "month") {
                return;
              }
              let timezone = event.timezone ? event.timezone: "America/Toronto";
              let tzDate = date.clone();
              tzDate.tz(timezone, true);

              let now = moment.tz(timezone);
              console.log('tzDate = ' + tzDate.format());
              console.log('now = ' + now.format());
              if (tzDate.isBefore(now.startOf('day'))) {
                self.$toast.open({
                  message: 'Cannot create appointment in the past',
                  type: 'is-warning',
                  duration: 1500
                })
                return;
              }
              self.serviceBooking = {
                date: tzDate.toDate(),
              };
              self.selectedAppointment = null;
            },
            // callback for when the user clicks on a time in day or week view
            select(start, end, event, view, resource){
              console.log('start = ' + start.format());

              let timezone = event.timezone ? event.timezone: "America/Toronto";
              let tzStart = start.clone();
              tzStart.tz(timezone, true);
              console.log('tzStart = ' + tzStart.format());
              console.log('moment() = ' + moment().format());
              let now = moment.tz(timezone);
              console.log('moment(timezone) = ' + now.format());

              if (tzStart.isBefore(now)) {
                self.$toast.open({
                  message: 'Cannot create appointment in the past',
                  type: 'is-warning',
                  duration: 1500
                })
                self.$refs.calendar.fireMethod('unselect');
                return;
              }
              let practitioner = self.formattedPractitioners.find(function(element) {
                return element.id == resource.id;
              })
              self.serviceBooking = {
                practitioner: practitioner,
                practitionerName: practitioner.fullName,
                time: moment.tz(start, event.timezone).format("hh:mm A"),
                date: moment.tz(start, event.timezone).toDate(),
                mode: 'calendarClick',
              };
              self.selectedAppointment = null;
            },
            // event handler for when appointment is clicked in the calendar
            eventClick(event, jsEvent, view) {
              let aptCpy = Object.assign({}, event);
              delete aptCpy.source // get rid of this, causes a circular reference error when trying to JSON.stringify
              self.selectedAppointment = aptCpy;
              self.serviceBooking = null;
            },

            // callback to get resources (practitioners)
            resources: function(callback, start, end, timezone) {
              ApiService.get('/user').then(function(res) {
                let resourceArray = [];
                let filteredPractitioners = [];
                if (typeof self !== 'undefined') {
                  filteredPractitioners = res.data.result.filter( function(practitioner) {
                      return (self.practitionerFilterSelect.findIndex(
                        function (filteredPractitioner) {
                          return practitioner.id === filteredPractitioner;
                        }
                      ) > -1);
                    }
                  );
                }
                else {
                  filteredPractitioners = [self.$store.state.auth.user];
                }
                filteredPractitioners.forEach(function (practitioner) {
                  resourceArray.push(
                    {
                      id: practitioner.id,
                      title: practitioner.firstName + ' ' + practitioner.lastName,
                    }
                  );
                });

                //console.log("formatted practitioners are:" + JSON.stringify(resourceArray));
                callback(resourceArray);
              }).catch(function(err) {
                console.log(err);
              });
            }
          },
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
          const serviceSearchKey = (this.serviceBooking && this.serviceBooking.serviceName) ? this.serviceBooking.serviceName : ""
          return service.name
            .toString()
            .toLowerCase()
            .indexOf(serviceSearchKey.toLowerCase()) >= 0
        })
      },
      filteredPractitioners() {
        return this.formattedPractitioners.filter((practitioner) => {
          const searchKey = this.serviceBooking.practitionerName ? this.serviceBooking.practitionerName : "";
          return (practitioner.fullName)
            .toString()
            .toLowerCase()
            .indexOf(searchKey.toLowerCase()) >= 0
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
      formattedPractitioners() {
        let practitioners = this.practitioners.slice();

        practitioners.forEach(p => {
          p.fullName = p.firstName + " " + p.lastName;
        });
        return practitioners;
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

              // display events for only practitioners that are selected by user
              ApiService.get('/user').then(function(res) {
                let resourceArray = [];
                let filteredPractitioners = [];
                if (typeof self !== 'undefined') {
                  filteredPractitioners = res.data.result.filter(function (practitioner) {
                      return (self.practitionerFilterSelect.findIndex(
                        function (filteredPractitioner) {
                          return practitioner.id === filteredPractitioner;
                        }
                      ) > -1);
                    }
                  );
                }
                else {
                  filteredPractitioners = [self.$store.state.auth.user];
                }
                filteredPractitioners.forEach(function (practitioner) {
                  resourceArray.push(
                    {
                      id: practitioner.id,
                      title: practitioner.firstName + ' ' + practitioner.lastName,
                    }
                  );
                });

                console.log("filteredPractitioners.length = " + filteredPractitioners.length);
                let filteredPractitionersIds = filteredPractitioners.map(practitioner => practitioner.id);
                ApiService.get('/appointment', {
                    params: {
                      where: {
                        startDateTime: {
                          '>=': start
                        },
                        endDateTime: {
                          '<=': end
                        },
                        practitioner: filteredPractitionersIds,
                        status: [1, 2, 0],
                        // practitioner: self.$store.state.auth.user.id,
                      },
                      sort: 'startDateTime ASC',
                      limit: 100
                    }
                  }
                ).then(res => {
                  console.log("got the following appointments : " + JSON.stringify(res));
                  let formattedAppts = [];
                  filteredPractitioners.forEach(function (practitioner) {
                    // Full Calendar identifies Sunday as day 0 while moment treats Sunday as 7
                    // All other days are the same between the two
                    let practitionerAvailabilities = practitioner.availabilities.map(function (availability) {
                      if (availability.day === 7) {
                        availability.day = 0;
                      }
                      return availability;
                    });

                    // create events to grey out the timing that a practitoner is unavailable
                    practitionerAvailabilities.forEach(function (availabilityDay) {

                      formattedAppts.push(
                        {
                          title: 'not available',
                          dow: [availabilityDay.day],
                          start: '00:00',
                          end: moment(availabilityDay.from, "hh:mm A", true).format('HH:mm'),
                          resourceId: practitioner.id,
                          rendering: 'background',
                          backgroundColor: '#808080',
                        }
                      );
                      formattedAppts.push(
                        {
                          title: 'not available',
                          dow: [availabilityDay.day],
                          start: moment(availabilityDay.to, "hh:mm A", true).format('HH:mm'),
                          end: '23:59',
                          resourceId: practitioner.id,
                          rendering: 'background',
                          backgroundColor: '#808080',
                        }
                      );
                    });

                    // if the practitioner hasn't provided availability for a specific day of the week,
                    // then that means that they are not available for that day
                    let daysWithoutAvailability = _.range(0, 7).filter((day) => {
                      return (!practitionerAvailabilities.find(function (availabilityDay) {
                        return availabilityDay.day === day;
                      }));
                    });

                    daysWithoutAvailability.forEach((day) => {
                      //console.log("day = " + day);
                      formattedAppts.push(
                        {
                          title: 'not available',
                          dow: [day],
                          start: '00:00',
                          end: '23:59',
                          resourceId: practitioner.id,
                          rendering: 'background',
                          backgroundColor: '#808080',
                        }
                      );
                    });
                  });
                  res.data.result.forEach(function (appointment) {
                    let event = {
                      title: appointment.patientName + ':' + appointment.serviceName ? appointment.serviceName : "Break",
                      start: moment.tz(appointment.startDateTime, appointment.timezone).format(),
                      end: moment.tz(appointment.endDateTime, appointment.timezone).format(),
                      resourceId: appointment.practitioner.id,
                    }

                    appointment.startDateTime = moment.tz(appointment.startDateTime, appointment.timezone),
                      appointment.endDateTime = moment.tz(appointment.endDateTime, appointment.timezone);
                    appointment.isBookingCancellable = moment.tz(appointment.startDateTime, appointment.timezone)
                      .isAfter(moment.tz(appointment.timezone))

                    event = Object.assign(event, appointment)

                    if (self.$store.state.auth.user.id !== appointment.practitioner.id) {
                      event.color = '#1A8CFF';
                    }
                    else {
                      event.color = '#B833FF';
                    }
                    formattedAppts.push(event)
                  });
                  //console.log('formattedAppts = ' + JSON.stringify(formattedAppts));
                  callback(formattedAppts)
                })
                  .catch(err => console.log(err))
              });
            },
          }
        ]

        return eventSources
      }
    },
    created() {
      this.getServices()
      this.getPatients()
      this.getPractitioners()
      this.getSoapNoteTemplates()

      // logged in user is selected by default
      this.practitionerFilterSelect = []
      this.practitionerFilterSelect.push(this.$store.state.auth.user.id);
    },
    watch: {
      'serviceBooking.date': function (newDate, oldDate) {
        const serviceBooking = this.serviceBooking;
        if (serviceBooking && serviceBooking.practitioner && serviceBooking.service) {
          this.findEmptySlots(moment(newDate).format('YYYY-MM-DD'));
        }
      },
      'serviceBooking.practitioner': function (newPractitioner, oldPractitioner) {
        const serviceBooking = this.serviceBooking;
        if (serviceBooking && serviceBooking.practitioner && serviceBooking.service && serviceBooking.date) {
          this.findEmptySlots(moment(serviceBooking.date).format('YYYY-MM-DD'));
        }
      },
      'serviceBooking.service': function (newService, oldService) {
        const serviceBooking = this.serviceBooking;
        if (serviceBooking && serviceBooking.practitioner && serviceBooking.service && serviceBooking.date) {
          this.findEmptySlots(moment(serviceBooking.date).format('YYYY-MM-DD'));
        }
      },
      breakBooking: {
        handler: function (newBreakBooking, oldBreakBooking) {
          if (newBreakBooking && newBreakBooking.date && newBreakBooking.duration) {
            //console.log("Get available break slots.")
            this.findBreakSlots(moment(newBreakBooking.date).format('YYYY-MM-DD'));
          }
        },
        deep: true
      },
      practitionerFilterSelect: {
        handler: function (newPractitionerFilterSelect, oldPractitionerFilterSelect) {
          this.$refs.calendar.fireMethod('refetchResources');
          this.$refs.calendar.$emit('refetch-events')
        },
        deep: true
      }
    },
    methods: {
      getResources() {
        let self = this;
        self.resources = [];
        ApiService.get('/user').then(function(res) {
          //console.log("practitioners are:" + JSON.stringify(res.data.result));
          res.data.result.forEach(function (practitioner) {
            self.resources.push(
              {
                id: practitioner.id,
                title: practitioner.firstName + ' ' + practitioner.lastName,
              }
            );
          });
          //console.log("formatted practitioners are:" + JSON.stringify(resources));
          return self.resources;
        }).catch(function(err) {
          console.log(err);
        });
      },
      selectService(service) {
        if(!service) return
        this.serviceBooking.service = service
      },
      selectPractitioner(practitioner) {
        if(!practitioner)  {
          return;
        }
        this.serviceBooking.practitioner = practitioner;
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
        ApiService.get('/service').then(res => self.services = res.data.result)
          .catch(err => console.log(err));
      },
      getPractitioners() {
        let self = this;
        ApiService.get('/user').then(function (res) {
          self.practitioners = res.data.result;
        })
          .catch(err => console.log(err));
      },
      getPatients() {
        let self = this;
        ApiService.get('/patient').then(res => self.patients = res.data.result)
          .catch(err => console.log(err))
      },
      startAppointmentDraft() {
        console.log("Starting new draft appointment")
        this.serviceBooking = {mode: 'formSearch'};
        this.selectedAppointment = null;
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

        ApiService.post(`/appointment`, bodyParams).then(function (response) {
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
      async createAppointment() {
        // TODO: send email notification to patient & practitioner
        let self = this;

        if (!self.serviceBooking.service || !self.serviceBooking.practitioner || !self.serviceBooking.patient ||
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
          practitionerId: self.serviceBooking.practitioner.id,
          startDateTime: startDateTime,
          patientId: self.serviceBooking.patient.id
        };

        ApiService.post(`/appointment`, bodyParams).then(function (response) {
          //console.log(response.data.message);
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
          self.$refs.calendar.fireMethod('unselect');
          self.$refs.calendar.$emit('refetch-events')
        }).catch(function (reason) {
          self.$toast.open({
            message: 'Unable to create appointment',
            type: 'is-danger',
            duration: 2000
          })
          console.log(reason);
        })
      },
      async cancelAppointment(appointment) {
        // TODO: use in-page popup instead of browser confirmation prompt
        // TODO: send patient an email notifying them of the cancellation
        let self = this;
        const confirmedCancel = confirm("Are you sure you want to cancel this appointment?");

        if (confirmedCancel) {
          ApiService.delete(`/appointment/${appointment.id}`).then(function (response) {
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
        let params = {
          date: date,
          practitionerId: self.serviceBooking.practitioner.id
        }

        if (self.serviceBooking.service) {
          params.serviceId = self.serviceBooking.service.id;
        }

        ApiService.get(`/findEmptySlots`, {
          params: params
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
          }
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
  div .dropdown.navbar-item {
    padding-left : 0;
  }

</style>

<style>
  @import 'https://fullcalendar.io/releases/fullcalendar/3.9.0/fullcalendar.min.css';
  @import 'https://fullcalendar.io/releases/fullcalendar-scheduler/1.9.4/scheduler.min.css';
  .fc-timelineWeek-view .fc-timeline-event, .fc-timelineDay-view .fc-timeline-event {
    height: 57px;
    margin-bottom: 1px;
    margin-top: 1px;
    border-color: black !important;
    border-style: solid;
    padding-bottom: 0px;
    padding-top: 0px;
  }
  .fc-timelineWeek-view .fc-widget-content .fc-content .fc-title,
  .fc-timelineDay-view .fc-widget-content .fc-content .fc-title {
    white-space : normal;
    vertical-align: middle;
    display: inline-block;
    line-height: normal;
  }

  .fc-month-view .fc-content-skeleton, .fc-month-view .fc-day  {
    cursor: pointer;
  }

  .fc-timelineWeek-view .fc-time-area .fc-content .fc-widget-content,
  .fc-timelineDay-view .fc-time-area .fc-content .fc-widget-content {
    cursor: pointer;
  }

  .fc-timelineWeek-view .fc-time-area .fc-bgevent-container,
  .fc-timelineDay-view .fc-time-area .fc-bgevent-container {
    cursor: not-allowed;
  }

  .fc-timelineWeek-view .fc-event-container .fc-content,
  .fc-timelineDay-view .fc-event-container .fc-content {
    cursor: pointer;
  }

  .fc-timelineWeek-view .fc-widget-content .fc-content,
  .fc-timelineDay-view .fc-widget-content .fc-content {
    line-height: 60px;
    text-align: center;
    vertical-align: middle;
  }

  .fc-timelineWeek-view .fc-widget-content .fc-cell-content,
  .fc-timelineDay-view .fc-widget-content .fc-cell-content {
    padding-top: 0px ;
    padding-bottom: 0px !important;
  }
  .fc-timelineWeek-view .fc-widget-content .fc-rows div,
  .fc-timelineDay-view .fc-widget-content .fc-rows div {
    height: 60px !important;
  }
  .fc-timelineWeek-view .fc-widget-content .fc-rows table tbody tr,
  .fc-timelineDay-view .fc-widget-content .fc-rows table tbody tr {
    height:60px;
  }
</style>
