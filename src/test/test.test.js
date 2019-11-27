/* eslint-disable no-console */
const io = require('socket.io-client');
const request = require('request');
const util = require('util');

const post = async (...params) => (await util.promisify(request.post)(...params)).body;

(async () => {
  const socket = io('http://localhost:3000');

  const { token, data } = await post({
    url: 'http://localhost:3000/connection',
    body: {
      username: 'cesium133',
      password: 'azerty',
    },
    json: true,
  });

  const { gameId } = await post({
    url: 'http://localhost:3000/create-game',
    body: { token },
    json: true,
  });

  socket.emit('join', { id: gameId, user: { username: data.username } });
  socket.on('user-joined', (param) => {
    console.log(param);
  });
  socket.emit('start-game', { id: gameId });
  socket.on('question', (question) => {
    console.log(question.label);
    socket.emit('replay', {
      id: gameId,
      responseIndex: Math.round(Math.random()), // the index of the chosen response
    });
    socket.emit('vote', {
      id: gameId,
      username: data.username, // the index of the chosen response
    });
  });

  socket.on('chosen', (params) => {
    console.log(params);
  });

  socket.on('new-score', (params) => {
    console.log(params);
  });

  socket.on('game-over', (score) => {
    console.log(score);
  });
})();
