const { Pool } = require('pg');
const conf = require('./config.js')

const pool = new Pool(conf);


pool.on("connect", () => {
    console.log("Connected");
})

pool.on("end", () => {
    console.log("Dissconnected");
})

module.exports = pool;