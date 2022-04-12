const express = require('express');
const pool = require('./server.js')
const { v4: uuvid4 } = require('uuid');
const PORT = 4000;
const app = express();

app.use(express.json());

pool.connect();


const time = new Date;
const time_string = time.getMonth() + "/" + time.getDate() + "/" + time.getFullYear() + " " + time.getHours() + ":" + time.getMinutes();

app.get(`/users`, async (req, res) => {
    const result = await pool.query(`SELECT * FROM Users`);
    res.status(200).send(result.rows);
})


app.post(`/users`, async (req, res) => {
    const { name, email, password } = req.body;
    if (!email.match(`@gmail.com`)) {
        throw new Error("Invalid email");
    }
    const pattern = new RegExp("(?=.*[A-Z])(?=.*[-+_!@#$%^&*., ?])");
    if (!pattern.test(password)) {
        throw new Error("Invalid password");
    }

    await pool.query(`INSERT INTO Users(name, email, password, id) VALUES($1, $2, $3, $4)`, [name, email, password, uuvid4()]).catch((err) => {
        res.status(401).send(`My message, ${err}`);
    })
    res.send(`New user added`);
})

app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    await pool.query(`UPDATE Users SET name=$1, email=$2, password=$3 WHERE id=$4`, [name, email, password, userId]).catch((err) => {
        res.status(401).send("something went wrong");
    })
    res.status(200).send("User data changed!");
})


app.get(`/notes`, async (req, res) => {
    const getNotes = await pool.query(`SELECT * FROM Notes ORDER BY title ASC`).catch((err) => {
        res.status(401).send("something went wrong!");
    })

    res.status(200).send(getNotes.rows);
})

app.post(`/notes/:user_id`, async (req, res) => {
    const { title, is_checked } = req.body;
    await pool.query(`INSERT INTO Notes(title, is_checked, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5`, [title, is_checked, req.params.user_id, time_string, time_string]).catch((err) => {
        res.status(401).send(`something went wrong`);
    })

    res.status(200).send(`New note created and linked to the mentioned user`);
})

app.get('/notes/:user_id', async (req, res) => {
    const currentObject = await pool.query(`SELECT * FROM Notes WHERE id=$1`, [req.params.user_id]).catch((err) => {
        res.status(401).send(`something went wrong`);
    })
    res.status(200).send(currentObject.rows);
})

app.delete(`/notes/:note_id`, async (req, res) => {
    await pool.query(`DELETE FROM Notes WHERE user_id=$1 RETURNING Notes.*`, [req.params.note_id]).catch((err) => {
        res.status(401).send(`something went wrong`);
    })
    res.status(201).send();
})

app.put(`/notes/:note_id`, async (req, res) => {
    const { title, is_checked } = req.body;
    await pool.query(`UPDATE Notes SET title=$1, is_checked=$2, updated_at=$3 RETURNING Notes.*`, [title, is_checked, time_string]).catch((err) => {
        res.status(401).send(`something went wrong`);
    })
    res.status(200).send(`Data updated!`);
})

app.listen(PORT);


