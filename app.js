
const express = require('express')
const app = new express()
require('dotenv').config();
const PORT =process.env.PORT || 5000
const routes = require("./routes")
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require('cors')

const DBConnection = require('./config/DB_connection')

DBConnection();

app.use(cors(
    {
        origin:["http://localhost:3000","http://localhost:3001","https://cozak-dash-board.vercel.app"],
        credentials: true,
    }
))

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", routes);


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
