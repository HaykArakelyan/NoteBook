const express = require('express');
const pool = require('./server.js')
const { v4: uuvid4 } = require('uuid');
const utils = require('./utils.js');

const pattern = new RegExp('(?=.*[A-Z])(?=.*[-+_!@#$%^&*., ?])');
const PORT = 4000;
const app = express();


app.use(express.json());


pool.connect();

app.get('/users', async (req, res) => {
    const { rows } = await pool.query(`SELECT * FROM Users`);
    res.status(200).send(rows);
})


app.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    if (!email.match(`@gmail.com`)) {
        throw new Error('Invalid email');
    }
    if (!pattern.test(password)) {
        throw new Error('Invalid password');
    }

    const newUser = await pool.query(`INSERT INTO Users(name, email, password, id) VALUES($1, $2, $3, $4) RETURNING Users.*`, [name, email, password, uuvid4()]).catch((err) => {
        res.status(422).send(`couldn't add user, ${err}`);
    })
    res.send(newUser.rows);
})

app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    const updatedUser = await pool.query(`UPDATE Users SET name=$1, email=$2, password=$3 WHERE id=$4 RETURNING Users.*`, [name, email, password, userId]).catch((err) => {
        res.status(501).send(`couldn't update the user ${err}`);
    })
    res.status(200).send(updatedUser.rows);
})


app.get('/notes', async (req, res) => {
    const getNotes = await pool.query(`SELECT * FROM Notes ORDER BY title ASC`).catch((err) => {
        res.status(500).send(`unable to show the list ${err}`);
    })

    res.status(200).send(getNotes.rows);
})

app.post('/notes/:user_id', async (req, res) => {
    const { title, is_checked } = req.body;
    const newNote = await pool.query(`INSERT INTO Notes(title, is_checked, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING Notes.*`, [title, is_checked, req.params.user_id, utils.getTime(), utils.getTime()]).catch((err) => {
        res.status(421).send(`couldn't add note ${err}`);
    })

    res.status(200).send(newNote.rows);
})

app.get('/notes/:user_id', async (req, res) => {
    const currentObject = await pool.query(`SELECT * FROM Notes WHERE id=$1`, [req.params.user_id]).catch((err) => {
        res.status(500).send(`unable to show the list ${err}`);
    })
    res.status(200).send(currentObject.rows);
})

app.delete('/notes/:note_id', async (req, res) => {
    const deletedNote = await pool.query(`DELETE FROM Notes WHERE user_id=$1 RETURNING Notes.*`, [req.params.note_id]).catch((err) => {
        res.status(500).send(`couldn't delete the note ${err}`);
    })
    res.status(201).send(deletedNote.rows);
})

app.put('/notes/:note_id', async (req, res) => {
    const { title, is_checked } = req.body;
    const updatedNote = await pool.query(`UPDATE Notes SET title=$1, is_checked=$2, updated_at=$3 RETURNING Notes.*`, [title, is_checked, utils.getTime()]).catch((err) => {
        res.status(500).send(`couldn't update the note ${err}`);
    })
    res.status(200).send(updatedNote.rows);
})

app.listen(PORT);


