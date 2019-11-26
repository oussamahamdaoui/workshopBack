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


app.use(bodyParser.json());


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


connectDb().then(async () => {
  http.listen(3000, () => {
    console.log('listening on *:3000');
  });
}).catch((e) => {
  console.error(`db connection error: ${JSON.stringify(e)}`);
});

io.on('connection', (/* socket */) => {
  console.log('a user connected');
});
