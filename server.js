const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
  console.log('Palette Picker running on localhost:3000');
});

///*///  GET ALL PROJECTS  ///*///
app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then((projects) => {
      response.status(200).json(projects);
    })
    .catch((error) => {
      response.status(500).json({ error })
    });
});

///*///  GET ALL PALETTES  ///*///
app.get('/api/v1/palettes', (request, response) => {
  database('palettes').select()
    .then((palettes) => {
      response.status(200).json(palettes);
    })
    .catch((error) => {
      response.status(500).json({ error })
    });
});

///*///  GET PALETTES BY PROJECT_ID  ///*///
app.get('/api/v1/palettes/:project_id', (request, response) => {
  const { project_id } = request.params;

  database('palettes').where('project_id', project_id).select()
    .then((palettes) => {
      response.status(200).json(palettes);
    })
    .catch((error) => {
      response.status(500).json({ error })
    });
});

///*///  CREATE NEW PROJECT  ///*///
app.post('/api/v1/projects', async (request, response) => {
  const newProject = request.body;

  if (newProject) {
    const newId = await database('projects').returning('id').insert(newProject)
    const objToReturn = await database('projects').where('id', newId[0]).select()
    return response.status(201).json(objToReturn[0])
  } else {
    return response.status(422).send({
      error: "Project Name Required"
    })
  }
});

///*///  CREATE NEW PALETTE  ///*///
app.post('/api/v1/palettes', async (request, response) => {
  const newPalette = request.body;
  console.log(newPalette)

  if (newPalette) {
    const newId = await database('palettes').returning('id').insert(newPalette)
    const objToReturn = await database('palettes').where('id', newId[0]).select()
    return response.status(201).json(objToReturn[0])
  } else {
    return response.status(422).send({
      error: "Palette Object Required"
    })
  }
});

///*///  UPDATE PALETTE  ///*///
app.put('/api/v1/palettes', async (request, response) => {
  const { id } = request.body;
  const updatePalette = request.body;

  if (id) {
    await database('palettes').where('id', id).update(updatePalette)
    return response.status(201).json(updatePalette)
  } else {
    return response.status(422).send({
      error: "Palette Id Required"
    })
  }
});

///*///  DELETE PROJECT BY ID ///*///
app.delete('/api/v1/projects/:id', async (request, response) => {
  const { id } = request.params;

  if (id) {
    await database('projects').where('id', id).delete()
    return response.send({
      success: `Project id ${id} deleted`
    })
  } else {
    return response.status(422).send({
      error: "Project not found."
    })
  }
});

///*///  DELETE PALETTE BY ID ///*///
app.delete('/api/v1/palettes/:id', async (request, response) => {
  const { id } = request.params;

  if (id) {
    await database('palettes').where('id', id).delete()
    return response.send({
      success: `Palette id ${id} deleted`
    })
  } else {
    return response.status(422).send({
      error: "Palette not found."
    })
  }
});





