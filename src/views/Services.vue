<template>
  <div>
    <div class="container is-fluid">
      <h1 class="title">
        Services
        <a @click="setService(null)" title='Create a new service'>
          <button class="fas fa-plus-circle fa-xs"></button>
        </a>
      </h1>
      <div class="columns main-columns">
        <div class="column is-3">
          <ul class="services">
            <li v-for="(service, index) in services" class="service-item">
            <span @click="selectService(service.id)" class="service-name">
              {{ service.name }}, {{ service.duration }} minutes, ${{service.price}} <i class="fas fa-edit"></i>
            </span>
              <ul class="practitioners">
                <li v-for="practitioner in service.practitioners">{{practitioner.firstName}} {{practitioner.lastName}}
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="column is-6" v-if="selectedService">
          <div class="edit-column">
            <div class="service-header">
              <h2 class="left-align subtitle">{{selectedService.name}}</h2>
              <span v-if="selectedServiceId !== null" class="right-align has-text-danger delete-button"
                    @click="deleteService(selectedService.id)">
              <i class="fas fa-minus-circle"></i>
            </span>
              <div class="clear"></div>
            </div>
            <div class="edit-form">

              <label class="label">Status</label>
              <div class="field">
                <b-switch v-model="selectedService.enabled"
                          true-value="enabled"
                          false-value="disabled">
                  {{selectedService.enabled}}
                </b-switch>
              </div>
              <div class="field">
                <label class="label">Name</label>
                <div class="control">
                  <input class="input" v-model="selectedService.name" type="text" placeholder="Service name">
                </div>
              </div>
              <div class="field">
                <label class="label">Duration</label>
                <div class="field has-addons">
                  <div class="control is-expanded">
                    <input class="input" v-model="selectedService.duration" type="number"
                           placeholder="Service duration">
                  </div>
                  <p class="control">
                    <a class="button is-static">
                      minutes
                    </a>
                  </p>
                </div>
              </div>
              <div class="field">
                <label class="label">Price</label>
                <div class="field has-addons">
                  <p class="control">
                    <a class="button is-static">
                      $
                    </a>
                  </p>
                  <div class="control is-expanded">
                    <input class="input" v-model="selectedService.price" type="number" placeholder="Service price">
                  </div>
                </div>
              </div>
              <div class="field">
                <label class="label">Description</label>
                <div class="control">
                  <textarea class="textarea" v-model="selectedService.description" placeholder="Description"></textarea>
                </div>
              </div>
              <div class="field is-grouped">
                <div class="control">
                  <button v-if="(this.selectedServiceId !== null)" @click="updateService" class="button is-link">Save
                  </button>
                  <button v-else @click="createService" class="button is-link">Create</button>
                </div>
                <div class="control">
                  <button @click="selectService(null)" class="button is-text">Cancel</button>
                </div>
              </div>

              <div class="has-text-danger" v-if="errors">
                {{ errors }}
              </div>
            </div><!-- /div.edit-form -->
          </div>
        </div><!-- /div.edit-column -->
        <div class="column is-2" v-if="selectedServiceId !== null">
          <h2 class="subtitle has-text-centered">Offered By</h2>
          <ul class="has-text-centered">
            <li v-for="p in practitioners">
              <div class="field">
                <div class="control has-text-centered">
                  <label class="checkbox" @click.prevent="practitionerLinkHandler(p.id, selectedService.id)">
                    <input type="checkbox" :value="p.id" v-model="offeringPractitioners">
                    {{p.firstName}} {{p.lastName}}
                  </label>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ApiService from '@/services/ApiService'

  // TODO: make duration a dropdown of durations chunked appropriately (eg. 15,30,45,60,75,90,105,120...mins)
  // TODO: implement validation for fields

  export default {
    name: 'Appointments',
    data() {
      return {
        services: [],
        practitioners: [],
        selectedService: null,
        errors: null
      }
    },
    computed: {
      offeringPractitioners() {
        if (this.selectedServiceId !== null) {
          const service = this.services.find(s => s.id === this.selectedServiceId)
          if (service) {
            return service.practitioners.map(p => p.id)
          }
        }

        return []
      },

      selectedServiceId() {
        if (this.selectedService && this.selectedService.id !== undefined) {
          return this.selectedService.id
        }

        return null;
      },
    },
    created() {
      this.getServices()
      this.getPractitioners()
    },
    methods: {
      setService(service) {
        if (service === null) {
          // Creating a new service, initialize form values here
          service = {
            enabled: true
          }
        }
        this.selectedService = Object.assign({}, service)
        this.selectedService.enabled = this.selectedService.enabled ? "enabled" : "disabled"
      },
      selectService(serviceId) {
        // Called when a service is selected from the service list
        console.log("Selecting service: " + serviceId)
        this.errors = null;

        if (serviceId === null) {
          this.selectedService = null;
        }
        else {
          const service = this.services.find(s => s.id === serviceId)
          this.setService(service)
        }
      },
      getServices() {
        let self = this;
        ApiService.get('/service', {
          withCredentials: true
        }).then(res => self.services = res.data.result)
          .catch(err => console.log(err))
      },
      getPractitioners() {
        let self = this;
        ApiService.get('/user', {
          withCredentials: true
        }).then(res => self.practitioners = res.data.result)
          .catch(err => console.log(err))
      },
      async deleteService(serviceId) {
        const confirmDelete = confirm("Are you sure you want to delete this service?");
        if (!confirmDelete) return

        console.log("Deleting service..." + serviceId)
        try {
          await ApiService({
            url: `/service/${serviceId}`,
            method: 'delete',
            withCredentials: true
          })

          const serviceIdx = this.services.findIndex(s => s.id === serviceId);
          this.services.splice(serviceIdx, 1)
          this.selectedService = null
        }
        catch (err) {
          console.log(err)
        }

      },
      practitionerLinkHandler(practitionerId, serviceId) {
        let self = this;
        let method = this.offeringPractitioners.includes(practitionerId) ? 'delete' : 'put'

        ApiService({
          url: `service/${serviceId}/practitioners/${practitionerId}`,
          method: method,
          withCredentials: true,
        }).then(res => {
          console.log(res.data.message)
          self.getServices()
          self.$toast.open({
            message: 'Practitioner link updated successfully!',
            type: 'is-success',
            duration: 1000
          })
        }).catch(err => {
          console.log(err)
        })
      },
      async createService() {
        console.log("Creating service")
        let self = this;
        let newService = Object.assign({}, this.selectedService);

        try {
          const res = await ApiService({
            url: `/service`,
            method: 'post',
            withCredentials: true,
            data: newService
          })

          self.setService(res.data.result);
          self.getServices()
          self.$toast.open({
            message: 'Service created successfully!',
            type: 'is-success',
            duration: 1500
          })
          self.errors = null
        }
        catch (err) {
          console.log(err)
          self.errors = "Something went wrong, please try again"
        }
      },
      updateService() {
        console.log("Updating service");
        let self = this;
        let updatedService = Object.assign({}, this.selectedService);

        delete updatedService.practitioners

        updatedService.enabled = (updatedService.enabled === "enabled") ? true : false

        ApiService.patch(`/service/${updatedService.id}`, updatedService,
          {
            withCredentials: true
          }).then(res => {
          self.setService(res.data.result[0])
          self.getServices()
          self.$toast.open({
            message: 'Service updated successfully!',
            type: 'is-success',
            duration: 1000
          })
          self.errors = null
        }).catch(err => {
          console.log(err)
          self.errors = "Something went wrong, please try again"
        })
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .container {
    .main-columns {
      margin-bottom: 0;
    }
    padding-top: 20px;
    .delete-button:hover {
      cursor: pointer;
    }
    ul.services, ol.services {
      li.service-item {
        padding: 7px 0;
      }
      span.service-name {
        font-weight: bold;
      }
      span.service-name:hover {
        cursor: pointer;
      }
    }
    ul.practitioners {
      li {
        padding-left: 1.75rem;
      }
    }
    div.edit-column {
      .edit-form {
        border: 1px solid rgba(205, 226, 224, 0.53);
        padding: 1rem;
        border-radius: 16px;
      }
    }
  }
</style>
