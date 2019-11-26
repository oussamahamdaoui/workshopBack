const { guidGenerator } = require('./utils');
const { MAX_USERS_PER_GAME } = require('./conf');

class Game {
  constructor() {
    this.id = guidGenerator();
    this.sockets = new Map();
    this.questions = [];
    this.currentQuestion = 0;
    this.timeout = null;
    this.started = false;
  }

  join(socket, user) {
    if (this.started || this.sockets.values.length >= MAX_USERS_PER_GAME) {
      return;
    }
    this.sockets.set(socket, user);
    socket.emit('game-joined', true);
  }

  broadCast(type, message) {
    this.sockets.keys.forEach((socket) => {
      socket.emit(type, message);
    });
  }

  leave(socket) {
    const userLeft = this.sockets.get(socket);
    this.broadCast('user-left', userLeft);
    this.sockets.delete(socket);
  }

  nextQuestion() {
    const ret = this.questions[this.currentQuestion];
    this.currentQuestion += 1;
    return ret;
  }


  start() {
    this.sockets.keys.forEach((socket) => {
      socket.emit('question', this.nextQuestion());
    });
  }
}

module.exports = Game;
