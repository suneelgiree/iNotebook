const connectDB = require('./db');// Import the connectDB function
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';// Ignore self-signed certificate error
var cors = require('cors')

connectDB();// Connect to the database

const express = require('express')// Import express
const app = express()// Create an express app
const port = 5000;// Define the port

app.use(cors())
app.use(express.json());// Use express.json() to parse the request body
//available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));


app.listen(port, () => {
  console.log(`iNotebook backend listening at http://localhost:${port}`)// Listen on the port
})