const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const connectDb = require('./Db');
const {
  withHashedPassword,
  comparePassword,
  verifyJWTMiddlewear,
  createJWToken,
  safe,
} = require('./utils');

// Models
const User = require('./models/User.model');
const Question = require('./models/Question.model');
const Game = require('./Game');

const Games = new Map();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});


app.post('/create-account', async (req, res) => {
  const userWithHashedPassword = await withHashedPassword(req.body);
  await (new User(userWithHashedPassword)).save();
  return res.json({
    success: true,
  });
});

app.post('/connection', async (req, res) => {
  const credentials = req.body;
  const user = await User.findByUserName(credentials.username);
  if (user && await comparePassword(credentials.password, user.password)) {
    return res.json({
      success: true,
      data: safe(user),
      token: createJWToken({
        sessionData: user,
      }),
    });
  }
  return res.json({
    success: false,
  });
});

app.post('/add-question', verifyJWTMiddlewear, async (req, res) => {
  const { isHR } = req.user;
  if (isHR === false) {
    return res.json({
      success: false,
      message: 'You are not HR',
    });
  }

  await (new Question({
    ...req.body,
    userId: req.user._id,
  })).save();
  return res.json({
    success: true,
  });
});

app.post('/get-questions', verifyJWTMiddlewear, async (req, res) => {
  res.json(await Question.getAll(req.user._id));
});

app.post('/create-game', verifyJWTMiddlewear, async (req, res) => {
  const questions = await Promise.all(new Array(10).fill().map(async () => Question.getRandom()));
  const game = new Game();
  game.setQuestions(questions);
  Games.set(game.id, game);
  res.json({
    success: true,
    gameId: game.id,
  });
});


connectDb().then(async () => {
  http.listen(3000, () => {
    console.log('listening on *:3000');
  });
}).catch((e) => {
  console.error(`db connection error: ${JSON.stringify(e)}`);
});

io.on('connection', (socket) => {
  socket.on('join', ({ id, user }) => {
    if (!Games.has(id)) return;
    Games.get(id).join(socket, user);
  });

  socket.on('vote', ({ id, username }) => {
    if (!Games.has(id)) return;
    Games.get(id).vote(socket, username);
  });

  socket.on('replay', ({ id, responseIndex }) => {
    if (!Games.has(id)) return;
    Games.get(id).replay(socket, responseIndex);
  });


  socket.on('start-game', ({ id }) => {
    if (!Games.has(id)) return;
    if (Games.get(id).has(socket)) {
      Games.get(id).start();
    }
  });

  socket.on('disconnect', () => {
    const game = Array.from(Games.values).find((g) => g.has(socket));
    if (game) {
      game.leave(socket);
    }
  });
});
