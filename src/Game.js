const { guidGenerator } = require('./utils');
const { MAX_USERS_PER_GAME } = require('./conf');
const { deepCopy } = require('./utils');

class Game {
  constructor() {
    this.id = guidGenerator();
    this.sockets = new Map();
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.timeout = null;
    this.started = false;
    this.score = 0;
    // to be reset after every round
    this.voted = new Map();
  }

  getByUsername(username) {
    return Array.from(this.sockets.values).find((e) => e.username === username);
  }

  has(socket) {
    return this.sockets.has(socket);
  }

  join(socket, user) {
    if (this.started || Array.from(this.sockets.values).length >= MAX_USERS_PER_GAME) {
      return;
    }
    this.sockets.set(socket, user);
    this.broadCast('user-joined', {
      users: Array.from(this.sockets.values),
    });
  }

  broadCast(type, message) {
    this.sockets.keys.forEach((socket) => {
      socket.emit(type, message);
    });
  }

  leave(socket) {
    if (!this.sockets.has(socket)) return;
    const userLeft = this.sockets.get(socket);
    this.broadCast('user-left', { user: userLeft });
    this.sockets.delete(socket);
  }

  nextQuestion() {
    const ret = deepCopy(this.questions[this.currentQuestionIndex]);
    this.currentQuestionIndex += 1;
    ret.responses = ret.responses.map((response) => ({ label: response.label }));
    return ret;
  }

  setQuestions(questions) {
    this.questions = questions;
  }

  replay(socket, responseIndex) {
    if (!this.sockets.has(socket)) return;
    const currentQuestion = this.questions[this.currentQuestionIndex];
    const user = this.sockets.get(socket);
    user.score += currentQuestion.responses[responseIndex].points;
    user.currentResponse = responseIndex;
    this.sockets.set(socket, user);
  }

  vote(socket, username) {
    if (this.sockets.has(socket) && !this.voted.has(socket)) {
      const votedFor = this.getByUsername(username).username;
      this.voted.set(socket, votedFor);
    }
  }

  calculateRound() {
    let max = 0;
    let winner = null;

    Array.from(this.voted.values).reduce((prev, current) => {
      // eslint-disable-next-line no-param-reassign
      prev[current] = prev[current] ? prev[current] + 1 : 1;
      max = max < prev[current] ? prev[current] : max;
      winner = max < prev[current] ? current : winner;
      return prev;
    }, {});

    this.broadCast('chosen', { username: winner });
    const finalResponse = this.getByUsername(winner).currentResponse;
    const earnedPoints = this.questions[this.currentQuestionIndex].responses[finalResponse].points;
    this.score += earnedPoints;
    this.broadCast('new-score', {
      score: this.score,
    });
    this.voted.clear();
  }


  start() {
    if (this.currentQuestionIndex < this.questions.length) {
      this.broadCast('question', this.nextQuestion());
      setTimeout(() => {
        this.calculateRound();
        this.start();
      }, 9000);
    } else {
      this.broadCast('game-over', this.score);
    }
  }
}

module.exports = Game;
