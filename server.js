const { Pool } = require('pg');

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "myuser",
    password: "mypass",
    database: "db",
})


pool.on("connect", () => {
    console.log("Connected");
})

pool.on("end", () => {
    console.log("Dissconnected");
})

module.exports = pool;