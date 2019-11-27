## Start


run `npm watch` for dev

run `npm start` for prod

You need to have mongodb installed

### Create a user `POST` to `/create-account`:

````javascript
{
  name: { type: String, required: true },
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  isHR: { type: Boolean, default: false },
}
````

returns:

````javascript
{
  success: Boolean,
}
````


### Connect a user `POST` to `/connection`:

````javascript
{
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
}
````

returns:

````javascript
{
  success: Boolean,
  data:{
    name: { type: String, required: true },
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    isHR: { type: Boolean, default: false },
  },
  token: String,
}
````

### Add a question `POST` to `/add-question`:

````javascript
{
  label: String,
  responses: [
    {
      label: String,
      points: Number,
    },
  ],
  tags: [],
  token: String,
}
````

returns:

````javascript
{
  success:Boolean,
}
````

### Get My questions `POST` to `/get-questions`:

````javascript
{
  token: String,
}
````

returns:

````javascript
{
  success:Boolean,
}
````

### Create game `POST` to `/create-game`:

````javascript
{
  token: String,
}
````

returns:

````javascript
{
  success:Boolean,
  gameId:String,
}
````

## Communication with socket.io

To communicate in a game you need to use `socket.emit(event, paramObject)` for example `socket.emit('join', { gameId })`
You should always provide the `gameId`


### Connect to game socket.emit('join', params)`, with params:

````javascript
{
  gameId: String,
  user:{
    username:String,
  }
}
````

### To listen for a when a new user joined  `socket.on('user-joined', (params)=>{}})`, with params:

````javascript
{
  users: [
    {
      username:String,
    }
  ],
}
````


### To start a game  `socket.emit('start-game', params)`, with params:

````javascript
{
  gameId: String,
}
````

### Listen for the question  `socket.on('question', (params)=>{}})`, with params:

````javascript
{
  label: String,
  responses:[
    {
      label: String,
    }
  ],
}
````

### Vote for a user  `socket.emit('vote', params)`, with params:

````javascript
{
  gameId: String,
  username: String,
}
````


### Replay to the question `socket.emit('replay', params)`, with params:

````javascript
{
  gameId: String,
  response: Number, // the index of the chosen response
}
````


### Listen for the chosen user from the poll `socket.on('chosen', (params)=>{}})`, with params:

````javascript
{
  username: String;
}
````

### Listen for the new score `socket.on('new-score', (params)=>{}})`, with params:

````javascript
{
  score: Number;
}
````

### Listen for the game over `socket.on('game-over', (params)=>{}})`, with params:

````javascript
{
  score: Number;
}
````

### Listen for a user disconnected `socket.on('game-over', (params)=>{}})`, with params:

````javascript
{
  username: String;
}
````




