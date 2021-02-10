<template>
  <div class="container">
    <div class="row">
      <!-- Forma za read -->
      <div class="col-12">


        <button class="btn btn-info mb-3" @click="getData">Get data</button>

        <div class="row">
          <div class="col-md-4 mb-3" v-for="book in allData" :key="book.Id">
            <div class="card">
              <div class="card-body">
                <p>ID: {{ book.Id }}</p>
                <p>Name: {{ book.Name }}</p>
                <p>Country: {{ book.Country }}</p>
                <p>Title: {{ book.Title }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import axios from "axios";

export default {
  name: 'Home',
  data() {
    return {
      allData: [],
    };
  },
  methods: {
    getData: function (e) {
      e.preventDefault();

      axios.get('/api/library')
          .then(response => this.allData = response.data)
          .catch(error => console.error(error));
    },
  }
}
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