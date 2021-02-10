<template>
  <div class="container">
    <div class="row">

      <!-- Add -->
      <div class="col-md-4">
        <h3 class="mb-4">Add New</h3>
        <form
            @submit="submitForm"
            method="post"
        >
          <div class="form-group">
            <label for="inputName">Name</label>
            <input
                type="text"
                class="form-control"
                v-bind:class="{ 'error-border': nameError1 }"
                id="inputName"
                v-model="addName"
            >
            <p v-if="nameError1" class="error">{{ nameError1 }}</p>
          </div>

          <div class="form-group">
            <label for="inputCountry">Country</label>
            <input
                type="text"
                class="form-control"
                v-bind:class="{ 'error-border': countryError1 }"
                id="inputCountry"
                v-model="addCountry"
            >
            <p v-if="countryError1" class="error">{{ countryError1 }}</p>
          </div>

          <div class="form-group">
            <label for="inputTitle">Title</label>
            <input
                type="text"
                class="form-control"
                v-bind:class="{ 'error-border': titleError1 }"
                id="inputTitle"
                v-model="addTitle">
            <p v-if="titleError1" class="error">{{ titleError1 }}</p>
          </div>

          <button type="submit" class="btn btn-primary">Add New</button>
        </form>
      </div>

      <!-- Update -->
      <div class="col-md-4">
        <h3 class="mb-4">Update One</h3>

        <form
            method="post"
            @submit="updateOne"
        >
          <div class="form-group">
            <label for="updateId">ID</label>
            <input
                type="text"
                class="form-control"
                v-bind:class="{ 'error-border': idError1 }"
                id="updateId"
                v-model="id"
            >
            <p v-if="idError1" class="error">{{ idError1 }}</p>
          </div>

          <div class="form-group">
            <label for="updateName">Name</label>
            <input
                type="text"
                class="form-control"
                v-bind:class="{ 'error-border': nameError }"
                id="updateName"
                v-model="nameUpdate"
            >
            <p v-if="nameError" class="error">{{ nameError }}</p>
          </div>

          <div class="form-group">
            <label for="updateCountry">Country</label>
            <input
                type="text"
                class="form-control"
                v-bind:class="{ 'error-border': countryError }"
                id="updateCountry"
                v-model="countryUpdate"
            >
            <p v-if="countryError" class="error">{{ countryError }}</p>
          </div>

          <div class="form-group">
            <label for="updateTitle">Title</label>
            <input
                type="text"
                class="form-control"
                v-bind:class="{ 'error-border': titleError }"
                id="updateTitle"
                v-model="titleUpdate">
            <p v-if="titleError" class="error">{{ titleError }}</p>
          </div>

          <button type="submit" class="btn btn-warning">Update One</button>
        </form>
      </div>

      <!-- Delete -->
      <div class="col-md-4">
        <h3 class="mb-4">Delete One</h3>
        <form
            @submit="deleteOne"
        >
          <div class="form-group">
            <label for="inputId">ID</label>
            <input
                type="text"
                class="form-control"
                v-bind:class="{ 'error-border': idError }"
                id="inputId"
                v-model="deleteId"
            >
            <p v-if="idError" class="error">{{ idError }}</p>
          </div>

          <button type="submit" class="btn btn-danger">Delete</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HelloWorld',
  data() {
    return {
      id: '',
      idError1: '',
      idError: '',
      deleteId: '',
      addName: '',
      nameUpdate: '',
      nameError1:'',
      nameError: '',
      addCountry: '',
      countryUpdate: '',
      countryError1: '',
      countryError: '',
      addTitle: '',
      titleUpdate: '',
      titleError1: '',
      titleError: '',
      allData: [],
    };
  },
  methods: {
    submitForm: function (e) {
      e.preventDefault();

      const data = {
        Name: this.addName,
        Country: this.addCountry,
        Title: this.addTitle,
      };

      console.log('ADD:', data);

      if (this.addName === '') {
        this.nameError1 = 'Enter your name!';
      } else if (this.addName.length < 5 || this.addName.length > 25) {
        this.nameError1 = 'Enter your name with length between 4 and 25!';
      } else {
        this.nameError1 = '';
      }

      if (this.addCountry === '') {
        this.countryError1 = 'Enter your country!';
      } else if (this.addCountry.length < 3 || this.addCountry.length>25) {
        this.countryError1 = 'Enter your country with length between 2 and 25!';
      } else {
        this.countryError1 = '';
      }

      if (this.addTitle === '') {
        this.titleError1 = 'Enter title!';
      } else {
        this.titleError1 = '';
      }

      if (this.addName && this.addCountry && this.addTitle) {
        axios.post('/api/library', data)
            .then(response => console.log(response))
            .catch(error => console.error(error));
      } else {
        console.log('Data is empty!');
      }
    },
    updateOne: function (e) {
      e.preventDefault();

      const data = {
        Name: this.nameUpdate,
        Country: this.countryUpdate,
        Title: this.titleUpdate,
      };

      console.log('UPDATE:', data);

      if (this.id === '') {
        this.idError1 = 'Enter the number!';
      } else {
        this.idError1 = '';
      }

      if (this.nameUpdate === '') {
        this.nameError = 'Enter your name!';
      } else if (this.nameUpdate.length < 5 || this.nameUpdate.length > 25) {
        this.nameError = 'Enter your name with length between 4 and 25!';
      } else {
        this.nameError = '';
      }

      if (this.countryUpdate === '') {
        this.countryError = 'Enter your country!';
      } else if (this.countryUpdate.length < 3 || this.countryUpdate.length>25) {
        this.countryError = 'Enter your country with length between 2 and 25!';
      } else {
        this.countryError = '';
      }

      if (this.titleUpdate === '') {
        this.titleError = 'Enter title!';
      } else {
        this.titleError = '';
      }

      if (this.id) {
        axios.put('/api/book/' + this.id, data)
            .then(response => console.log(response))
            .catch(error => console.error(error));
      }
    },
    deleteOne: function (e) {
      e.preventDefault();

      if (this.deleteId === '') {
        this.idError = 'Enter the number!';
      } else {
        this.idError = '';
      }


      if (this.deleteId) {
        axios.delete('/api/book/' + this.deleteId)
            .then(response => console.log(response))
            .catch(error => console.error(error));
      }
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.error {
  color: red;
}

.error-border {
  border: 1px solid red;
}
</style>