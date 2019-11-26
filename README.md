## Start


run `npm watch` for dev

run `npm start` for prod

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
  name: { type: String, required: true },
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  isHR: { type: Boolean, default: false },
}
````