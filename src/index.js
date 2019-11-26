const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const connectDb = require('./Db');
const {
  withHashedPassword,
  comparePassword,
} = require('./utils');

const User = require('./models/User.model');


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
    delete user.password;
    return res.json({
      success: true,
      user,
    });
  }
  return res.json({
    success: false,
  });
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
