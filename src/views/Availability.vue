<template>
  <div><div class="container is-fluid">
    <h1 class="title">Availability</h1>
    <div class="column is-6">
    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
      <thead>
      <tr>
        <th class="has-text-centered">Enable</th>
        <th class="has-text-centered">Day</th>
        <th class="has-text-centered">Start Time</th>
        <th class="has-text-centered">End Time</th>
      </tr>
      </thead>
      <tbody>
      <tr class="day-entry" v-for="entry in practitionerAvailability">
        <td><b-checkbox v-model="entry.enabled"></b-checkbox></td>
        <th class="has-text-centered">{{entry.day}}</th>
        <td><vue-timepicker hide-clear-button format="hh:mm A" v-model="entry.start" :disabled="!entry.enabled" :minute-interval="5"></vue-timepicker></td>
        <td><vue-timepicker hide-clear-button format="hh:mm A" v-model="entry.end" :disabled="!entry.enabled" :minute-interval="5"></vue-timepicker></td>
      </tr>
      </tbody>

    </table>
    <button type="submit" name="save" @click="submitChanges" class="button is-link">Save</button>
    <button type="reset" name="cancel" @click="undoChanges" class="button is-text">Undo Changes</button><br>
    </div>
    {{practitionerAvailability.monday}}
  </div>
  </div>
</template>

<script>
  import ApiService from '@/services/ApiService'
  import VueTimepicker from 'vue2-timepicker'
  import moment from 'moment-timezone'
  var _ = require('lodash');
  export default {
    name: 'Availability',
    components : {VueTimepicker},
    data() {
      return {
        availabilityData : null,
        practitionerAvailability : this.initAvailabitilties(),
      }
    },
    computed: {
    },
    created() {
      this.getAvailabilities();
    },
    methods: {
      initAvailabitilties() {
        return [
          {
            dayNumber : 1,
            day : 'Monday',
            start : {
              mm:'',
              hh:'',
              A:'',
            },
            end : {
              hh:'',
              mm:'',
              A:'',
            },
            enabled : false,
          },
          {
            dayNumber : 2,
            day : 'Tuesday',
            start : {
              hh:'',
              mm:'',
              A:'',
            },
            end : {
              hh:'',
              mm:'',
              A:'',
            },
            enabled : false,
          },
          {
            dayNumber : 3,
            day : 'Wednesday',
            start : {
              hh:'',
              mm:'',
              A:'',
            },
            end : {
              hh:'',
              mm:'',
              A:'',
            },
            enabled : false,
          },
          {
            dayNumber : 4,
            day : 'Thursday',
            start : {
              hh:'',
              mm:'',
              A:'',
            },
            end : {
              hh:'',
              mm:'',
              A:'',
            },
            enabled : false,
          },
          {
            dayNumber : 5,
            day : 'Friday',
            start : {
              hh:'',
              mm:'',
              A:'',
            },
            end : {
              hh:'',
              mm:'',
              A:'',
            },
            enabled : false,
          },
          {
            dayNumber : 6,
            day : 'Saturday',
            start : {
              hh:'',
              mm:'',
              A:'',
            },
            end : {
              hh:'',
              mm:'',
              A:'',
            },
            enabled : false,
          },
          {
            dayNumber : 7,
            day : 'Sunday',
            start : {
              hh:'',
              mm:'',
              A:'',
            },
            end : {
              hh:'',
              mm:'',
              A:'',
            },
            enabled : false,
          },
        ];
      },
      setAvailabilities(data) {
        this.practitionerAvailability = this.initAvailabitilties();

        for (let time in data) {
          const timeStart = moment(data[time].from, "hh:mm A", true);
          this.practitionerAvailability[data[time].day-1].start.hh = timeStart.format('hh');
          this.practitionerAvailability[data[time].day-1].start.mm = timeStart.format('mm');
          this.practitionerAvailability[data[time].day-1].start.A = timeStart.format('A');

          const timeEnd = moment(data[time].to, "hh:mm A", true);
          this.practitionerAvailability[data[time].day-1].end.hh = timeEnd.format('hh');
          this.practitionerAvailability[data[time].day-1].end.mm = timeEnd.format('mm');
          this.practitionerAvailability[data[time].day-1].end.A = timeEnd.format('A');

          this.practitionerAvailability[data[time].day-1].enabled = true;
        }
      },
      getAvailabilities() {
        let self = this;
        ApiService.get(`Availability/find`, {
          withCredentials: true
        })
          .then(function (response) {
            self.availabilityData = response.data.result;
            self.setAvailabilities(self.availabilityData);
            console.log(self.practitionerAvailability);
          })
          .catch(function (reason) {
            console.log(reason);
          })
      },
      undoChanges() {
        console.log('undoing changes');
        console.log(this.practitionerAvailability);
        this.setAvailabilities(this.availabilityData);
      },
      submitChanges() {
        console.log('submitting changes');
        let self = this;
        let toAdd = {};

        for (let i = 0; i < this.practitionerAvailability.length; ++i) {
          let element = this.practitionerAvailability[i];
          if (element.enabled) {
            toAdd[element.dayNumber] = {
              from: element.start.hh + ':' + element.start.mm + ' '  + element.start.A,
              to: element.end.hh + ':' + element.end.mm + ' '  + element.end.A,
            }
          }
        }
        const addBody = {
          availabilities: toAdd
        };
        console.log('to add');
        ApiService.post('/availability', addBody,
          { withCredentials: true,}
        ).then(function (response) {
          self.$toast.open({
            message: 'Saved Succesfully',
            type: 'is-success',
            duration: 1500
          });
          console.log(response);
          self.getAvailabilities();
        }
        ).catch(function(err) {
          self.$toast.open({
            message: 'Unable to save',
            type: 'is-danger',
            duration: 1500
          });
          console.log(err);
        });
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  span.time-picker {
    width : 100%;
  }

  span.time-picker input.display-time {
    width: 100%;
  }
</style>
