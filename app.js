const express = require('express');
const lib = require('./routes/library');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/api', lib);
app.use(express.static(path.join(__dirname, 'client/library/nesto/dist')));

app.get('/', (req, res) => {
    res.sendFile(__dirname, 'client/library/nesto/dist/index.html');
});


console.log('Started server on port 3000...');
app.listen(3000);