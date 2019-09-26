const express = require('express');
const app = express();
const users = require('./routes/users');
const recipes = require('./routes/recipes');
const categories = require('./routes/categories');
const ingredients = require('./routes/ingredients');
const measurements = require('./routes/measurements');

app.use(express.json());

app.use('/api/users', users);
app.use('/api/recipes', recipes);
app.use('/api/categories', categories);
app.use('/api/ingredients', ingredients);
app.use('/api/measurements', measurements);


const port = 8193;
app.listen(port, () => { console.log(`Listening on port: ${port} ...`) });