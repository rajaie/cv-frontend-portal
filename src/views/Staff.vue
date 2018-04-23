<template>
  <div>
    <div class="container is-fluid">
      <h1 class="title">Staff
      <a @click="createUserTemplate" title='Create a new user'>
        <button class="fas fa-plus-circle fa-xs"></button>
      </a>
      </h1>
      <div class="columns main-columns">
        <div class="column is-3">
          <ul class="user-list" >
            <li v-for="user in userList" class="user">
              <span @click="selectUser(user.id)" class="user-name">
                {{user.firstName}} {{user.lastName}} ({{user.username}})  <div class="fas fa-edit"></div>
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
                  <div class="user-form-data">
                    <b-field label="Role">
                      <b-input v-model="selectedUser.role" disabled></b-input>
                    </b-field>
                    <b-field label="Username">
                      <b-input v-model="selectedUser.username" disabled></b-input>
                    </b-field>
                    <b-field label="First Name">
                      <b-input v-model="selectedUser.firstName"></b-input>
                    </b-field>
                    <b-field label="Last Name">
                      <b-input v-model="selectedUser.lastName"></b-input>
                    </b-field>
                    <b-field label="Email">
                      <b-input v-model="selectedUser.email" placeholder="Email" type="email"></b-input>
                    </b-field>
                    <b-field label="Mobile Number">
                      <b-input v-model="selectedUser.mobileNumber" type="tel"></b-input>
                    </b-field>
                  </div>
                  <button type="submit" name="save" @click="submitUserUpdate" class="button is-link">Save</button>
                  <button type="reset" name="cancel" @click="undoUserUpdate" class="button is-text">Cancel</button><br>
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
                  <b-field label="Role">
                    <b-input v-model="newUser.role" disabled></b-input>
                  </b-field>
                  <b-field label="Username">
                    <b-input v-model="newUser.username"></b-input>
                  </b-field>
                  <b-field label="Password">
                    <b-input type="password" password-reveal v-model="newUser.password" v-on:keyup.native="comparePasswords"></b-input>
                  </b-field>
                  <b-field label="Confirm Password" :type="passwordsMatch?'':'is-danger'" :message="passwordsMatch?'':'Passwords must match'">
                    <b-input type="password" password-reveal v-model="newUser.passwordConfirmation" v-on:keyup.native="comparePasswords"></b-input>
                  </b-field>
                  <b-field label="First Name">
                    <b-input v-model="newUser.firstName"></b-input>
                  </b-field>
                  <b-field label="Last Name">
                    <b-input v-model="newUser.lastName"></b-input>
                  </b-field>
                  <b-field label="Email">
                    <b-input v-model="newUser.email" placeholder="Email" type="email"></b-input>
                  </b-field>
                  <b-field label="Mobile Number">
                    <b-input v-model="newUser.mobileNumber" type="tel"></b-input>
                  </b-field>
                  <button type="submit" name="save" @click="submitNewUser" class="button is-link">Save</button>
                  <button type="reset" name="cancel" @click="undoNewUser" class="button is-text">Cancel</button><br>
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
  //TODO: convert role to be a dropdown option instead of a text option
  import ApiService from '@/services/ApiService'

  export default {
    name: 'Staff',
    data() {
      return {
        userList : [],
        selectedUser : null,
        newUser : null,
        passwordsMatch : true,
      }
    },
    computed: {
    },
    created() {
      this.getUserProfiles();
    },
    methods: {
      getUserProfiles() {
        let self = this;
        ApiService.get('/user', {
            params: {
              populate: "false",
              where: {
                deleted: false,
              },
              sort: 'id ASC',
            }
          }
        ).then(function(response) {
          self.userList = response.data.result;
        })
      },
      selectUser(userId) {
        const user = this.userList.find(u => u.id === userId)
        this.newUser = null;
        this.selectedUser = Object.assign({},user);
      },
      submitUserUpdate() {
        let self = this;
        const body = {
          'email': this.selectedUser.email,
          'mobileNumber': this.selectedUser.mobileNumber,
          'firstName': this.selectedUser.firstName,
          'lastName': this.selectedUser.lastName,
        }
        ApiService.patch(
          '/user/'+this.selectedUser.id,
          body).then(function(response) {
          self.$toast.open({
            message: response.data.message,
            type: 'is-success',
            duration: 2000
          })
          if (self.$store.state.auth.user.id === self.selectedUser.id) {
            self.$store.commit("setUser", response.data.result[0]);
          }
          self.getUserProfiles();
        }).catch(function (err) {
          self.$toast.open({
            message: err.response.data.message,
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

        const confirmDelete = confirm("Are you sure you want to delete this user?");
        if (!confirmDelete) { return;}

        ApiService.delete(
          '/user/'+this.selectedUser.id
        ).then(function(response) {
          self.$toast.open({
            message: response.data.message,
            type: 'is-success',
            duration: 2000
          });
          self.getUserProfiles();
          self.selectedUser = null;
        }).catch(function (err) {
          self.$toast.open({
            message: err.response.data.message,
            type: 'is-danger',
            duration: 2000
          });
          self.getUserProfiles();
          self.selectedUser = null;
        });
      },
      submitNewUser() {
        let self = this;
        if (this.newUser.password !== this.newUser.passwordConfirmation) {
          self.$toast.open({
            message: 'Passwords must match to new create user',
            type: 'is-danger',
            duration: 2000
          });
          return;
        }
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
          userInfo
        ).then(function(response) {
          self.$toast.open({
            message: response.data.message,
            type: 'is-success',
            duration: 2000
          });
          self.getUserProfiles();
          self.newUser = null;
        }).catch(function (err) {
          self.$toast.open({
            message: err.response.data.message,
            type: 'is-danger',
            duration: 2000
          });
        });
      },
      undoNewUser() {
        this.newUser = null;
      },
      createUserTemplate() {
        this.selectedUser = null;
        // initialize the new user, set the default value of the role to be practitioner
        this.newUser = {'role' : 'practitioner'};
      },
      comparePasswords() {
        if (this.newUser.password === this.newUser.passwordConfirmation) {
          this.passwordsMatch = true;
        }
        else {
          this.passwordsMatch = false;
        }
      }
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
    }
    div.user-form-data {
      margin-bottom: 2rem;
    }
    div.edit-user-header{
      margin-bottom: 4rem;
      font-weight: bold;
    }
    span.delete-button:hover {
      cursor: pointer;
    }
  }
</style>
