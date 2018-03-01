<template>
  <div class="container is-fluid">
    <h1 class="title">Invoices</h1>
    <div class="columns">
      <div class="column invoice-list">
        <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
          <thead>
          <tr>
            <th><abbr title="Invoice Number">No.</abbr></th>
            <th>Date</th>
            <th>Practitioner</th>
            <th>Service</th>
            <th>Duration</th>
            <th>Patient</th>
            <th>Total</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="invoice in invoices" @click="selectInvoice(invoice)" class="invoice-row">
            <th class="has-text-centered">#{{invoice.id}}</th>
            <td>{{invoice.createdAtMoment.format("YYYY-MM-DD")}}</td>
            <td>{{invoice.appointment.practitionerName}}</td>
            <td>{{invoice.appointment.serviceName}}</td>
            <td>{{invoice.appointment.duration}} mins</td>
            <td>{{invoice.appointment.patientName}}</td>
            <td>${{invoice.total}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div v-if="selectedInvoice" class="column is-two-fifths invoice-column">
        <h1 class="title">INVOICE</h1>
        <div class="right-align">Invoice #{{selectedInvoice.id}}</div>
        <div class="left-align">{{selectedInvoice.createdAtMoment.format("MMM DD, YYYY")}}</div>
        <div class="clear"></div>
        <div class="has-text-centered">
          <div>{{clinic.name}}</div>
          <div>{{clinic.address}}</div>
          <div>{{clinic.officeNumber}}</div>
          <div>{{clinic.email}}</div>
        </div>
        <div><strong>Billed To:</strong> {{selectedInvoice.appointment.patientName}}</div>
        <div><strong>Item:</strong> {{selectedInvoice.appointment.duration}} minutes {{selectedInvoice.appointment.serviceName}}</div>
        <div><strong>Price:</strong> ${{selectedInvoice.total}}</div>
        <div><strong>Practitioner:</strong> {{selectedInvoice.appointment.practitionerName}}</div>
      </div>
    </div>

  </div>
</template>

<script>
  // TODO: add pagination, add sorting by clicking columns, add searching
  // TODO: add "Email to Patient" button to send invoice to clients
  // TODO: show invoice in better table format
  // TODO: generate PDF of invoice on backend
  // TODO: email invoice to patient when invoice is created
  // TODO: add ability to update and delete invoices
  // TODO: show tax calculation in the invoice (include it in the Invoice record?)
  import ApiService from '@/services/ApiService'
  import moment from 'moment-timezone'

  export default {
    name: 'Invoices',
    data() {
      return {
        invoices: [],
        selectedInvoice: null,
        clinic: {},
      }
    },
    computed: {
    },
    created() {
      this.getInvoices();
      this.getClinic();
    },
    methods: {
      selectInvoice(invoice) {
        this.selectedInvoice = invoice
      },
      async getInvoices() {
        try {
          const invoices = await ApiService.get('/invoice')
          this.invoices = invoices.data.result
          this.invoices.forEach(function(i) {
            i.createdAtMoment = moment.tz(i.createdAt, i.appointment.timezone)
            i.appointment.duration = moment(i.appointment.endDateTime).diff(i.appointment.startDateTime, 'minutes')
          })
          console.log(this.invoices)
        }
        catch (e) {
          console.log(e.data.message);
        }
      },
      async getClinic() {
        try {
          const clinic = await ApiService.get('/clinic/0')
          this.clinic = clinic.data.result
          console.log(this.invoices)
        }
        catch (e) {
          console.log(e.data.message);
        }
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .container {
    padding-top: 20px;
    .invoice-row {
      &:hover {
        cursor: pointer;
      }
    }
    .invoice-column {
      border: 1px solid black;
      h1.title {
        margin-bottom: 0;
      }
    }
    table {
      thead {
        th {
          text-align: center;
        }
      }
    }
  }
</style>
