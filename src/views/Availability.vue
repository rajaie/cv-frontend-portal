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
        const defaultAvailabilityObj = {
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
        };

        var avails = [];
        avails.push(Object.assign(_.cloneDeep(defaultAvailabilityObj), {dayNumber : 1, day : 'Monday'}));
        avails.push(Object.assign(_.cloneDeep(defaultAvailabilityObj), {dayNumber : 2, day : 'Tuesday'}));
        avails.push(Object.assign(_.cloneDeep(defaultAvailabilityObj), {dayNumber : 3, day : 'Wednesday'}));
        avails.push(Object.assign(_.cloneDeep(defaultAvailabilityObj), {dayNumber : 4, day : 'Thursday'}));
        avails.push(Object.assign(_.cloneDeep(defaultAvailabilityObj), {dayNumber : 5, day : 'Friday'}));
        avails.push(Object.assign(_.cloneDeep(defaultAvailabilityObj), {dayNumber : 6, day : 'Saturday'}));
        avails.push(Object.assign(_.cloneDeep(defaultAvailabilityObj), {dayNumber : 7, day : 'Sunday'}));

        return avails;
      },
      setAvailabilities(availabilities) {
        this.practitionerAvailability = this.initAvailabitilties();

        for (let idx = 0; idx < availabilities.length; ++idx) {
          const timeStart = moment(availabilities[idx].from, "hh:mm A", true);
          this.practitionerAvailability[availabilities[idx].day-1].start.hh = timeStart.format('hh');
          this.practitionerAvailability[availabilities[idx].day-1].start.mm = timeStart.format('mm');
          this.practitionerAvailability[availabilities[idx].day-1].start.A = timeStart.format('A');

          const timeEnd = moment(availabilities[idx].to, "hh:mm A", true);
          this.practitionerAvailability[availabilities[idx].day-1].end.hh = timeEnd.format('hh');
          this.practitionerAvailability[availabilities[idx].day-1].end.mm = timeEnd.format('mm');
          this.practitionerAvailability[availabilities[idx].day-1].end.A = timeEnd.format('A');

          this.practitionerAvailability[availabilities[idx].day-1].enabled = true;
        }
      },
      getAvailabilities() {
        let self = this;
        ApiService.get(`availability`, {
          withCredentials: true
        })
          .then(function (response) {
            self.availabilityData = response.data.result;
            self.setAvailabilities(self.availabilityData);
            console.log(self.practitionerAvailability);
          })
          .catch(function (error) {
            console.log(error);
          })
      },
      undoChanges() {
        this.setAvailabilities(this.availabilityData);
      },
      submitChanges() {
        console.log('submitting changes');
        let self = this;
        let newAvailabilities = {};

        for (let i = 0; i < this.practitionerAvailability.length; ++i) {
          let availableDay = this.practitionerAvailability[i];
          if (availableDay.enabled) {
            newAvailabilities[availableDay.dayNumber] = {
              from: availableDay.start.hh + ':' + availableDay.start.mm + ' '  + availableDay.start.A,
              to: availableDay.end.hh + ':' + availableDay.end.mm + ' '  + availableDay.end.A,
            }
          }
        }
        const params = {
          availabilities: newAvailabilities,
        };
        ApiService.post('/availability', params,
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

<style lang="scss">
  span.time-picker {
    width : 100%;
  }

  span.time-picker input.display-time {
    width: 100%;
  }
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .container {
    padding-top: 20px;
  }
</style>
