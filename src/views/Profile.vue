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
          <div v-if="changePassword">
            <div class="change-password-form">
              <ul class="password-list">
                <li>Current Password <br><input type="password" name="old-password" v-model="oldPassword"><br></li>
                <li>New Password <br><input type="password" name="new-password" v-model="newPassword"><br></li>
              </ul>
              <button type="submit" name="save-password" @click="updatePassword" class="button is-link">Save</button>
              <button type="reset" name="cancel-password" @click="disablePasswordView" class="button is-text">Cancel</button><br>
              <div class="has-text-danger">{{error}}</div>
            </div>
          </div>
          <div v-else>
            <div class="settings-form">
              <ul class="settings-list">
                <li>Username:<br> <input type="text" name="username" v-model="user.username" disabled=true><br></li>
                <li>Role:<br> <input type="text" name="role" v-model="user.role" disabled=true><br></li>
                <li>First Name:<br> <input type="text" name="first-name" v-model="user.firstName" :disabled="!editMode"></li>
                <li>Last Name:<br> <input type="text" name="last-name" v-model="user.lastName":disabled="!editMode"><br></li>
                <li>Email:<br> <input type="email" name="email" v-model="user.email" :disabled="!editMode"><br></li>
                <li>Mobile Number:<br> <input type="tel" name="mobile-number" v-model="user.mobileNumber" :disabled="!editMode"><br></li>
              </ul>
              <button type="submit" name="save" @click="disableEditView();updateProfile()" v-show="editMode" class="button is-link">Save</button>
              <button type="reset" name="cancel" @click="disableEditView" v-show="editMode" class="button is-text">Cancel</button><br>
              <button type="button" name="change-password" @click="enablePasswordView" class="button is-link">Change Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // TODO: currently allow user to fill out fields that they are not able to actually update (example username),
  //   should disable those fields even during edit view
  // TODO: implement validation for fields
  // TODO: when a profile update fails, we currently don't reset the fields to be back to their original values. We may
  //   want to update this behaviour so that the fields are reset back to normal. Benefit of not submitting
  // TODO: we should reset the fields when the user clocks cancel after changing a field

  import ApiService from '@/services/ApiService'

  export default {
    name: 'Profile',
    data() {
      return {
        user : {
          username : '',
          email : '',
          mobileNumber : '',
          firstName : '',
          lastName : '',
          role : '',
        },
        editMode : false,
        changePassword : false,
        oldPassword : '',
        newPassword : '',
        error: null,
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
          self.user.username = response.data.result.username;
          self.user.email = response.data.result.email;
          self.user.mobileNumber = response.data.result.mobileNumber;
          self.user.firstName = response.data.result.firstName;
          self.user.lastName = response.data.result.lastName;
          self.user.role = response.data.result.role;
        }).catch(err => console.log(err))
      },
      updateProfile() {
        let self = this;
        const body = {
          'email': this.user.email,
          'mobileNumber': this.user.mobileNumber,
          'firstName': this.user.firstName,
          'lastName': this.user.lastName,
          'role' : this.user.role,
        }
        ApiService.put(
          '/user/'+self.$store.state.auth.user.id,
          body,
          { withCredentials: true }
        ).then(function(response) {
          self.$toast.open({
            message: 'Profile updated successfully',
            type: 'is-success',
            duration: 2000
          })
          self.$store.commit("login", response.data.result[0]);
        }).catch(function (err) {
          self.$toast.open({
            message: 'Unable to update profile',
            type: 'is-danger',
            duration: 2000
          })
        });
      },
      updatePassword() {
        let self = this;
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

          self.$toast.open({
             message: 'Password updated successfully',
             type: 'is-success',
             duration: 2000
           })

          self.error = null;
          self.oldPassword = null;
          self.newPassword = null;
          self.disablePasswordView();
        }).catch(err => {

          console.log(err)
          self.error = "Incorrect password entered."

        })
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
    button {
        margin-bottom: 0.75rem;
    }
  }
</style>
