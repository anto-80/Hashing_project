const express = require("express");
const basicAuth = require('express-basic-auth');
const bcrypt = require('bcrypt');

const {User, Item} = require('./models');

// initialise Express
const app = express();

// specify out request bodies are json
app.use(express.json());

//basic auth needs a config object
app.use(basicAuth({
  authorizer : dbAuthorizer, //custom authorizer fn
  authorizeAsync: true, //allow our authorizer to be async
  unauthorizedResponse : () => 'None shall pass!'
}))

//compares username + password with what's in the database
// Returns boolean indicating if password matches
async function dbAuthorizer(username, password, callback){
  try {
    // get user from DB
    const user = await User.findOne({where : {name : username}})
    // isValid == true if user exists and passwords match, false if no user or passwords don't match
    let isValid = (user != null) ? await bcrypt.compare(password, user.password) : false;
    callback(null, isValid); //callback expects null as first argument
  } catch(err) {
    console.log("OH NO AN ERROR!", err)
    callback(null, false);
  }
}

app.get('/', (req, res) => {
  res.send('<h1>Hello!!!!</h1>')
})

app.get('/users', async (req, res) => {
  //what should i put here?
  let users = await User.findAll()
  res.json({users});
})

app.get('/users/:id', async (req, res) => {
  let user = await User.findByPk(req.params.id);
  res.json({user});
})

// I want to get all items

app.get('/items', async(req, res)=> {
  let items = await Item.findAll();
  res.json({items});
})

// I want to get one item

app.get('/items/:id', async(req, res)=> {
  let item = await Item.findByPk(req.params.id);
  res.json({item});
})

// I want to delete one item

app.delete('/items/:id', async(req, res)=> {
  await Item.destroy({where: {id: req.params.id}});
  res.send('Deleted!')
})

// I want to create one item

app.post('/users', async(req, res)=> {
  const {name,password} = req.body;
  const hashPassword = await bcrypt.hash(password, 2)
   await User.create({name, password:hashPassword});
  res.status(201).send("Created!")
})

// I want to update one item

app.put('/users/:id', async(req, res)=> {
  let updatedUser = await User.update(req.body, {
    where : {id : req.params.id}
  });
  res.json({updatedUser})
})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});