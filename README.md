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
  }
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

