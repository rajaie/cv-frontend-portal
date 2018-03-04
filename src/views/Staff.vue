<template>
  <div>
    <div class="container is-fluid">
      <h1 class="title">Staff
      <a @click="createUser" title='Create a new user'>
        <button class="fas fa-plus-circle fa-xs"></button>
      </a>
      </h1>
      <div class="columns main-columns">
        <div class="column is-3">
          <ul class="user-list" >
            <li v-for="user in userList" class="user">
              <span @click="selectUser(user.id)" class="user-name">
                {{user.username}} ({{user.firstName}}, {{user.lastName}}) <div class="fas fa-edit"></div>
              </span>
            </li>
          </ul>
        </div>
        <div v-if="selectedUser" class="column is-4">
          <div class="edit-column">
            <div class="user-info">
              <div class="user-edit">
                <div class="edit-user-header">
                  <h2 class="left-align subtitle">{{selectedUser.firstName}} {{selectedUser.lastName}}</h2>
                  <span class="right-align has-text-danger delete-button" @click="deleteUser(selectedUser.id)">
                    <i class="fas fa-minus-circle"></i>
                  </span>
                </div>
                <div class="clear"></div>
                <div class="user-edit-form">
                  <ul class="user-edit-list">
                    <li>Username:<br> <input type="text" name="username" v-model="selectedUser.username" disabled=true><br></li>
                    <li>Role:<br> <select disabled=true>
                      <option :value="selectedUser.role">practitioner</option>
                    </select>
                    <li>First Name:<br> <input type="text" name="first-name" v-model="selectedUser.firstName"></li>
                    <li>Last Name:<br> <input type="text" name="last-name" v-model="selectedUser.lastName"></li>
                    <li>Email:<br> <input type="email" name="email" v-model="selectedUser.email"></li>
                    <li>Mobile Number:<br> <input type="tel" name="mobile-number" v-model="selectedUser.mobileNumber"></li>
                  </ul>
                  <button type="submit" name="save" @click="submitUserUpdate()" v-show="selectedUser" class="button is-link">Save</button>
                  <button type="reset" name="cancel" @click="undoUserUpdate" v-show="selectedUser" class="button is-text">Cancel</button><br>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="newUser" class="column is-4">
          <div class="add-column">
            <div class="user-info">
              <div class="user-edit">
                <div class="edit-user-header">
                  <h2 class="left-align subtitle">Create New User</h2>
                </div>
                <div class="clear"></div>
                <div class="user-edit-form">
                  <ul class="user-edit-list">
                    <li>Username:<br> <input type="text" name="username" v-model="newUser.username"><br></li>
                    <li>Password:<br> <input type="password" name="password" v-model="newUser.password"><br></li>
                    <li>Role:<br> <select>
                      <option value="practitioner">practitioner</option>
                    </select>
                    <li>First Name:<br> <input type="text" name="first-name" v-model="newUser.firstName"></li>
                    <li>Last Name:<br> <input type="text" name="last-name" v-model="newUser.lastName"></li>
                    <li>Email:<br> <input type="email" name="email" v-model="newUser.email"></li>
                    <li>Mobile Number:<br> <input type="tel" name="mobile-number" v-model="newUser.mobileNumber"></li>
                  </ul>
                  <button type="submit" name="save" @click="submitNewUser" v-show="newUser" class="button is-link">Save</button>
                  <button type="reset" name="cancel" @click="undoNewUser" v-show="newUser" class="button is-text">Cancel</button><br>
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
  //TODO: paginate list of staff
  //TODO: allow to search staff by name, id and other criteria
  //TODO: better error messaging when creating user/ for example inform user when the username doesn't exist etc.
  import ApiService from '@/services/ApiService'

  export default {
    name: 'Staff',
    data() {
      return {
        userList : [],
        selectedUser : null,
        newUser : null,
      }
    },
    computed: {
      selectedUserStr() {
        JSON.stringify(this.selectedUser);
      },
    },
    created() {
      this.getUserProfiles();
    },
    methods: {
      getUserProfiles() {
        let self = this;
        console.log("getting profiles");
        ApiService.get('/user', {
            params: {
              populate: "false",
              where: {
                deleted: false,
              },
              sort: 'id ASC',
            },
            withCredentials:true
          }
        ).then(function(response) {
          console.log("getting profiles for this clinic :" + JSON.stringify(response.data.result));
          self.userList = response.data.result;
        }).catch(err => console.log(err));
      },
      selectUser(userId) {
        const user = this.userList.find(u => u.id === userId)
        console.log('userId last selected = ' + user.id)
        this.newUser = null;
        this.selectedUser = user;
      },
      submitUserUpdate() {
        let self = this;
        const body = {
          'email': this.selectedUser.email,
          'mobileNumber': this.selectedUser.mobileNumber,
          'firstName': this.selectedUser.firstName,
          'lastName': this.selectedUser.lastName,
        }
        ApiService.put(
          '/user/'+this.selectedUser.id,
          body,
          { withCredentials: true }
        ).then(function(response) {
          self.$toast.open({
            message: 'Profile updated successfully',
            type: 'is-success',
            duration: 2000
          })
          if (self.$store.state.auth.user.id === self.selectedUser.id) {
            self.$store.commit("login", response.data.result[0]);
          }
        }).catch(function (err) {
          console.log("Error is:" + JSON.stringify(err));
          self.$toast.open({
            message: 'Unable to update profile',
            type: 'is-danger',
            duration: 2000
          })
        });
      },
      undoUserUpdate() {
        this.selectedUser = null;
      },
      async deleteUser() {
        let self = this;

        if (this.selectedUser.id === self.$store.state.auth.user.id) {
          self.$toast.open({
            message: "Can't delete your own profile!",
            type: 'is-danger',
            duration: 2000
          })
          return;
        }

        const confirmDelete = confirm("Are you sure you want to delete this service?");
        if (!confirmDelete) { return;}

        ApiService.delete(
          '/user/'+this.selectedUser.id,
          { withCredentials: true }
        ).then(function(response) {
          self.$toast.open({
            message: 'Profile deleted successfully',
            type: 'is-success',
            duration: 2000
          });
          self.getUserProfiles();
          self.selectedUser = null;
        }).catch(function (err) {
          console.log("Error is:" + JSON.stringify(err));
          self.$toast.open({
            message: 'Unable to delete profile',
            type: 'is-danger',
            duration: 2000
          });
          self.getUserProfiles();
          self.selectedUser = null;
        });
      },
      submitNewUser() {
        let self = this;
        const userInfo = {
          username: this.newUser.username,
          password: this.newUser.password,
          email: this.newUser.email,
          mobileNumber: this.newUser.mobileNumber,
          firstName: this.newUser.firstName,
          lastName: this.newUser.lastName,
          role: this.newUser.role,
        };
        ApiService.post(
          '/user/',
          userInfo,
          {withCredentials: true,}
        ).then(function(response) {
          self.$toast.open({
            message: 'New user created successfully',
            type: 'is-success',
            duration: 2000
          });
          console.log("newUser is " + JSON.stringify(self.newUser));
          self.getUserProfiles();
          self.selectedUser = null;
        }).catch(function (err) {
          self.$toast.open({
            message: 'Unable to create new user',
            type: 'is-danger',
            duration: 2000
          });
        });
      },
      undoNewUser() {
        this.newUser = null;
      },
      createUser() {
        this.selectedUser = null;
        this.newUser = {};
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .container {
    padding-top: 20px;
    padding-left: 7px;
    ul.user-list, ol.user-list {
      padding-left: 10px;
      li.user {
        padding: 7px 0;
      }
      span.user-name {
        font-weight: bold;
      }
      span.user-name:hover {
        cursor: pointer;
      }
    }
    div.user-edit {
      border: 1px solid rgba(205, 226, 224, 0.53);
      padding: 1rem;
      border-radius: 16px;
      ul.user-edit-list {
        li {
          padding-bottom: 0.75rem;
          font-weight: bold;
        }
      }
    }
  }
</style>
