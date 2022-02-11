const express = require('express');
const bodyParser = require('body-parser'); 
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const register = require('./controllers/register');

const db = knex({
    client: 'pg',
    connection: {
    host : '127.0.0.1',
    user : 'jekaprudnik',
    password : '',
    database : 'smart-brain'
    }
});

db.select('*').from('users').then(data => {
});

const app = express();

app.use(express.json());
app.use(cors());


app.get('/', (req, res) =>{
    res.send('success');
})

app.post('/signin', (req, res) =>{
    const {email, password,} = req.body;
    if (!email || !password){
        return res.status(404).json('incorrect submission')
    } 
    db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
        const isValid = bcrypt.compareSync(password, data[0].hash);
        if (isValid) {
            return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
                res.json(user[0])
            })
            .catch(err => res.status(400).json('UNABLE to get user'))
        }
        else{
            res.status(400).json('wrong password')
        }
    })
    .catch(err => res.status(400).json('wrong'))
})


app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt) })

app.get('/profile/:id', (req, res) => {
    const {id} = req.params;
    db.select('*').from('users').where({id})
        .then(user =>{
        if(user.length){
            res.json(user[0]);
        }
        else{
            res.status(400).json('Not found');
        }
        res.json(user[0]);
    })
    .catch(err => res.status(400).json('Error getting user'))
})

app.put('/image', (req, res) =>{
    const {id} = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries =>{
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('UNABLE getting entries'));
})

    app.listen(3000, ()=> {
    console.log('http://localhost:3000');
})


