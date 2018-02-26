<template>
  <div>
    <div class="container is-fluid">
      <h1 class="title">
        Profile
        <a @click="enableEditView" title='Edit Profile'>
          <button class="fas fa-edit"></button>
        </a>
      </h1>
      <div class="columns main-columns">
        <div class="column is-3">
          <template v-if="changePassword">
            <form class=change-password-form v-show="changePassword">
              <ul class="password-list">
                <li>Current Password <br><input type="password" name="old-password" v-model="oldPassword"><br></li>
                <li>New Password <br><input type="password" name="new-password" v-model="newPassword"><br></li>
              </ul>
              <button type="submit" name="save-password" @click="disablePasswordView(); updatePassword()" class="button is-link">Save</button>
              <button type="reset" name="cancel-password" @click="disablePasswordView" class="button is-text">Cancel</button><br>
            </form>
          </template>
          <template v-else>
            <form class=settings-form>
              <ul class="settings-list">
                <li>First Name:<br> <input type="text" name="first-name" v-model="firstName" :disabled="!editMode"></li>
                <li>Last Name:<br> <input type="text" name="last-name" v-model="lastName":disabled="!editMode"><br></li>
                <li>Username:<br> <input type="text" name="username" v-model="username" :disabled="!editMode"><br></li>
                <li>Email:<br> <input type="email" name="email" v-model="email" :disabled="!editMode"><br></li>
                <li>Role:<br> <input type="text" name="role" v-model="role" :disabled="!editMode"><br></li>
                <li>Mobile Number:<br> <input type="tel" name="mobile-number" v-model="mobileNumber" :disabled="!editMode"><br></li>
              </ul>
              <button type="submit" name="save" @click="disableEditView();updateProfile()" v-show="editMode" class="button is-link">Save</button>
              <button type="reset" name="cancel" @click="disableEditView" v-show="editMode" class="button is-text">Cancel</button><br>
              <button type="button" name="change-password" @click="enablePasswordView" class="button is-link">Change Password</button>
            </form>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // TODO: currently allow user to fill out fields that they are not able to actually update (example username),
  //   should disable those fields even during edit view
  // TODO: implement validation for fields

  import ApiService from '@/services/ApiService'

  export default {
    name: 'Profile',
    data() {
      return {
        username : '',
        email : '',
        mobileNumber : '',
        firstName : '',
        lastName : '',
        role : '',
        editMode : false,
        changePassword : false,
        oldPassword : '',
        newPassword : ''
      }
    },
    computed: {
    },
    created() {
      this.getProfile();
    },
    methods: {
      getProfile(){
        let self = this;
        console.log("getting profile");
        ApiService.get('/user/'+this.$store.state.auth.user.id, {
          withCredentials: true
        }).then(function(response) {
          self.username = response.data.result.username;
          self.email = response.data.result.email;
          self.mobileNumber = response.data.result.mobileNumber;
          self.firstName = response.data.result.firstName;
          self.lastName = response.data.result.lastName;
          self.role = response.data.result.role;
        }).catch(err => console.log(err))
      },
      updateProfile() {
        const body = {
          'email': this.email,
          'mobileNumber': this.mobileNumber,
          'firstName': this.firstName,
          'lastName': this.lastName,
          'role' : this.role,
        }
        ApiService.put(
          '/user/'+this.$store.state.auth.user.id,
          body,
          { withCredentials: true }
        ).then(function(response) {
          console.log('response = ' + JSON.stringify(response));
        }).catch(err => console.log(err))
      },
      updatePassword() {
        const body = {
          'oldPassword' : this.oldPassword,
          'newPassword' : this.newPassword,
        }
        ApiService.put(
          '/updatePassword/'+this.$store.state.auth.user.id,
          body,
          { withCredentials: true }
        ).then(function(response) {
          console.log('response = ' + JSON.stringify(response));
        }).catch(err => console.log(err))
      },
      enableEditView() {
        this.disablePasswordView();
        this.editMode = true;
      },
      disableEditView() {
        this.editMode = false;
      },
      enablePasswordView() {
        this.disableEditView();
        this.changePassword = true;
      },
      disablePasswordView() {
        this.changePassword = false;
      },
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    .main-columns {
      margin-bottom: 0;
    }
    padding-top: 20px;
    ul {
      li {
        padding-bottom: 0.75rem;
        font-weight: bold;
      }
    }
    form{
      button {
        margin-bottom: 0.75rem;
      }
    }
  }
</style>
