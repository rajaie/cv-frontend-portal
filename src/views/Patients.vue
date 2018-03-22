<template>
  <div>
    <div class="container is-fluid">
      <h1 class="title">Patients
        <a @click="createPatientTemplate" title='Create a new patient'>
          <button class="fas fa-plus-circle fa-xs"></button>
        </a>
      </h1>
      <div class="columns main-columns">
        <div class="column is-3">
          <ul class="patient-list" >
            <li v-for="patient in patientList" class="patient">
            <span @click="selectPatient(patient.id)" class="patient-name">
                {{patient.firstName}} {{patient.lastName}} (id: {{patient.id}})  <div class="fas fa-edit"></div>
              </span>
            </li>
          </ul>
        </div>
        <div v-if="selectedPatient" class="column is-4">
          <div class="edit-column">
            <div class="patient-info">
              <div class="patient-edit">
                <div class="edit-patient-header">
                  <h2 class="left-align subtitle">{{selectedPatient.firstName}} {{selectedPatient.lastName}}</h2>
                  <span class="right-align has-text-danger delete-button" @click="deletePatient">
                    <i class="fas fa-minus-circle"></i>
                  </span>
                </div>
                <div class="clear"></div>
                <div class="patient-edit-form">
                  <div class="patient-form-data">
                    <b-field label="First Name">
                      <b-input v-model="selectedPatient.firstName"></b-input>
                    </b-field>
                    <b-field label="Last Name">
                      <b-input v-model="selectedPatient.lastName"></b-input>
                    </b-field>
                    <b-field label="Email">
                      <b-input v-model="selectedPatient.email" placeholder="Email" type="email"></b-input>
                    </b-field>
                    <b-field label="Mobile Number">
                      <b-input v-model="selectedPatient.mobileNumber"></b-input>
                    </b-field>
                  </div>
                  <button type="submit" name="save" @click="submitPatientUpdate" class="button is-link">Save</button>
                  <button type="reset" name="cancel" @click="undoPatientUpdate" class="button is-text">Cancel</button><br>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="newPatient" class="column is-4">
          <div class="add-column">
            <div class="patient-info">
              <div class="patient-edit">
                <div class="edit-patient-header">
                  <h2 class="left-align subtitle">Create New Patient</h2>
                </div>
                <div class="clear"></div>
                <div class="patient-edit-form">
                  <div class="patient-form-data">
                    <b-field label="First Name">
                      <b-input v-model="newPatient.firstName"></b-input>
                    </b-field>
                    <b-field label="Last Name">
                      <b-input v-model="newPatient.lastName"></b-input>
                    </b-field>
                    <b-field label="Email">
                      <b-input v-model="newPatient.email" placeholder="Email" type="email"></b-input>
                    </b-field>
                    <b-field label="Mobile Number">
                      <b-input v-model="newPatient.mobileNumber"></b-input>
                    </b-field>
                  </div>
                  <button type="submit" name="create" @click="submitNewPatient" class="button is-link">Save</button>
                  <button type="reset" name="cancel" @click="undoNewPatient" class="button is-text">Cancel</button><br>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ApiService from '@/services/ApiService'

  // TODO: list upcoming appointments for the patient
  // TODO: Allow for viewing of soap notes, invoices and stuff from the patient profile
  //       (either a link to the other pages or a just a read-only view of the items in
  //        this page)
  // TODO: Validation of parameters

  export default {
    name: 'Appointments',
    data() {
      return {
        selectedPatient : null,
        newPatient : null,
        patientList : [],
      }
    },
    computed: {
    },
    created() {
      this.getPatients();
    },
    methods: {
      getPatients() {
        let self = this;
        console.log("getting patients");
        ApiService.get('/patient', {
          params: {
            where : {
              deleted : false,
            },
            populate: "false",
            sort: 'id ASC',
          }
        }).then(function(response) {
          console.log('results = ' + JSON.stringify(response.data.result));
          self.patientList = response.data.result;
        }).catch(err => console.log(err));
      },
      selectPatient(patientId) {
        const patient = this.patientList.find(u => u.id === patientId)
        this.newPatient = null;
        this.selectedPatient = Object.assign({}, patient);
      },
      deletePatient() {
        let self = this;
        const confirmDelete = confirm("Are you sure you want to delete this patient?");
        if (!confirmDelete) { return;}

        ApiService.delete(
          '/patient/'+this.selectedPatient.id).then(function(response) {
          self.$toast.open({
            message: 'Patient deleted successfully',
            type: 'is-success',
            duration: 2000
          });
          self.getPatients();
          self.selectedPatient = null;
        }).catch(function (err) {
          console.log("Error is:" + JSON.stringify(err));
          self.$toast.open({
            message: 'Unable to delete patient',
            type: 'is-danger',
            duration: 2000
          });
          self.getPatient();
          self.selectedPatient = null;
        });

      },
      submitPatientUpdate() {
        let self = this;
        const body = {
          email: this.selectedPatient.email,
          mobile: this.selectedPatient.mobileNumber,
          firstName: this.selectedPatient.firstName,
          lastName: this.selectedPatient.lastName,
        }
        ApiService.patch(
          '/patient/'+this.selectedPatient.id,
          body).then(function(response) {
          self.getPatients();
          self.$toast.open({
            message: 'Patient updated successfully',
            type: 'is-success',
            duration: 2000
          })
        }).catch(function (err) {
          console.log("Error is:" + err);
          self.$toast.open({
            message: 'Unable to update patient',
            type: 'is-danger',
            duration: 2000
          })
        });
      },
      undoPatientUpdate() {
        this.selectedPatient = null;
      },
      submitNewPatient() {
        let self = this;
        const patientInfo = {
          email: this.newPatient.email,
          mobile: this.newPatient.mobileNumber,
          firstName: this.newPatient.firstName,
          lastName: this.newPatient.lastName,
        };
        ApiService.post(
          '/patient/',
          patientInfo
        ).then(function(response) {
          self.$toast.open({
            message: 'New patient created successfully',
            type: 'is-success',
            duration: 2000
          });
          self.getPatients();
          self.newPatient = null;
          self.selectedPatient = response.data.result;
        }).catch(function (err) {
          self.$toast.open({
            message: 'Unable to create new patient',
            type: 'is-danger',
            duration: 2000
          });
        });
      },
      createPatientTemplate() {
        this.selectedPatient = null;
        this.newPatient = {};
      },
      undoNewPatient() {
        this.newPatient = null;
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .container {
    padding-top: 20px;
    .main-columns {
      margin-bottom: 0;
    }
    div.patient-form-data {
      margin-bottom: 2rem;
    }
    div.patient-edit {
      border: 1px solid rgba(205, 226, 224, 0.53);
      padding: 1rem;
      border-radius: 16px;
    }
    span.patient-name:hover {
      cursor: pointer;
    }
    span.delete-button:hover {
      cursor: pointer;
    }
    div.patient-edit-form {
      margin-top: 2rem;
    }
    h2.subtitle {
      margin-bottom:0rem;
    }
  }
</style>
