const axios = require('axios');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { authenticate } = require('../auth/authenticate');

const Actions = require('./users-model')

module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  let user = req.body
  const hash = bcrypt.hashSync(user.password, 10)
  user.password = hash;

  Actions.add(user)
    .then(saved => {
      res.status(201).json({ saved, message: "Successfully Registered!"})
    })
    .catch(err => {
      res.status(500).json(err)
    })
}

function login(req, res) {
  let { username, password } = req.body
  // implement user login

  Actions.findBy({ username })
    .first()
    .then(user => {
      if ( user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user)
        res.status(200).json({
          message: `Welcome ${user.username}`, token
        })
      } else {
        res.status(401).json({ message: 'Invalid Credentials' })
      }
    })
    .catch(err => {
      res.status(500).json(err)
    })
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}


function generateToken(user) {
  const payload = {
      subject: user.id,
      username: user.username,
      role: ['user']
  }

  const secret = 'pound sand!'

  const options = {
      expiresIn: '1h'
  }

  return jwt.sign(payload, secret, options)
}
