<template>
  <div>
    <div class="container is-fluid">
      <h1 class="title">
        Profile
        <a @click="enableEditView" title='Edit Profile'>
          <button class="fas fa-edit fa-xs"></button>
        </a>
      </h1>
      <div class="columns main-columns">
        <div class="column is-3">
          <div v-if="changePassword">
            <div class="change-password-form">
              <ul class="password-list">
                <li>Current Password <br><input class="input" type="password" name="old-password" v-model="oldPassword"><br></li>
                <li>New Password <br><input class="input" type="password" name="new-password" v-model="newPassword"><br></li>
              </ul>
              <button type="submit" name="save-password" @click="updatePassword" class="button is-link">Save</button>
              <button type="reset" name="cancel-password" @click="disablePasswordView" class="button is-text">Cancel</button><br>
              <div class="has-text-danger">{{error}}</div>
            </div>
          </div>
          <div v-else>
            <div class="settings-form">
              <ul class="settings-list">
                <li>Username:<br> <input class="input" type="text" name="username" v-model="userEdit.username" disabled=true><br></li>
                <li>Role:<br> <input class="input" type="text" name="role" v-model="userEdit.role" disabled=true><br></li>
                <li>First Name:<br> <input class="input" type="text" name="first-name" v-model="userEdit.firstName" :disabled="!editMode"></li>
                <li>Last Name:<br> <input class="input" type="text" name="last-name" v-model="userEdit.lastName":disabled="!editMode"><br></li>
                <li>Email:<br> <input class="input" type="email" name="email" v-model="userEdit.email" :disabled="!editMode"><br></li>
                <li>Mobile Number:<br> <input class="input" type="tel" name="mobile-number" v-model="userEdit.mobileNumber" :disabled="!editMode"><br></li>
              </ul>
              <button type="submit" name="save" @click="updateProfile" v-show="editMode" class="button is-link">Save</button>
              <button type="reset" name="cancel" @click="cancelUpdate" v-show="editMode" class="button is-text">Cancel</button><br>
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
        userSaved: this.initUser(),
        userEdit: this.initUser(),
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
      initUser () {
        return {
          username: '',
          email: '',
          mobileNumber: '',
          firstName: '',
          lastName: '',
          role: '',
        }
      },
      getProfile(){
        let self = this;
        console.log("getting profile");
        ApiService.get('/user/'+this.$store.state.auth.user.id).then(function(response) {
          self.userSaved = Object.assign({}, response.data.result);
          self.userEdit = Object.assign({}, response.data.result);
        }).catch(err => console.log(err))

      },
      updateProfile() {
        let self = this;
        const body = {
          'email': this.userEdit.email,
          'mobileNumber': this.userEdit.mobileNumber,
          'firstName': this.userEdit.firstName,
          'lastName': this.userEdit.lastName,
          'role' : this.userEdit.role,
        }
        ApiService.patch(
          '/user/'+self.$store.state.auth.user.id,
          body).then(function(response) {
          self.$toast.open({
            message: 'Profile updated successfully',
            type: 'is-success',
            duration: 2000
          });
          const user = response.data.result[0]
          self.$store.commit("setUser", user);
          self.userSaved = Object.assign({}, response.data.result[0]);
          self.userEdit = Object.assign({}, response.data.result[0]);
        }).catch(function (err) {
          console.log(err);
          self.$toast.open({
            message: 'Unable to update profile',
            type: 'is-danger',
            duration: 2000
          })
        });
      },
      cancelUpdate() {
        this.userEdit = Object.assign({}, this.userSaved);
        this.disableEditView();
      },
      updatePassword() {
        let self = this;
        const body = {
          'oldPassword' : this.oldPassword,
          'newPassword' : this.newPassword,
        }
        ApiService.patch(
          '/updatePassword/'+this.$store.state.auth.user.id,
          body
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
