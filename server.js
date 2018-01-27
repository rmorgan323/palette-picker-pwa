const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(app.get('port'), () => {
  console.log(`Palette Picker running on localhost:${app.get('port')}.`);
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

///*///  CREATE NEW PROJECT  ///*///
app.post('/api/v1/projects', async (request, response) => {
  const newProject = request.body;
  const nameCheck = await database('projects').where('project_name', newProject.project_name).select();
  
  if (Object.keys(nameCheck).length) {
    return response.status(400).send({ error: 'Name taken' })
  }

  if (newProject.project_name) {
    const newId = await database('projects').returning('id').insert(newProject)
    const objToReturn = await database('projects').select()

    return response.status(201).json(objToReturn)
  } else {
    return response.status(422).send({
      error: "Project Name Required"
    })
  }
});

///*///  CREATE NEW PALETTE  ///*///
app.post('/api/v1/palettes', async (request, response) => {
  const result = ['project_id', 'color_1', 'color_2', 'color_3', 'color_4', 'color_5'].every(prop => {
    return request.body.hasOwnProperty(prop);
  })

  if(result) {
    const newPalette = request.body;
    const newId = await database('palettes').returning('id').insert(newPalette)
    const objToReturn = await database('palettes').where('id', newId[0]).select()

    return response.status(201).json(objToReturn[0])
  } else {
    return response.status(422).json({
      error: 'You are missing properties'
    })
  }
});

///*///  GET PALETTES BY PROJECT_ID  ///*///
app.get('/api/v1/palettes/:project_id', async (request, response) => {
  const { project_id } = request.params;

  await database('palettes').where('project_id', project_id).select()
    .then((palettes) => {
      response.status(200).json(palettes);
    })
    .catch((error) => {
      response.status(500).json({ error })
    });
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
app.delete('/api/v1/projects/:projId', async (request, response) => {
  const { projId } = request.params;
  const deletedProj = await database('palettes').where('project_id', projId).delete()
    
  if (deletedProj) {
    await database('projects').where('id', projId).delete()
    return response.status(200).send({
      success: `Project id ${projId} deleted`
    })
  } else {
    return response.status(422).send({
      error: `Project id ${projId} not found`
    })
  }
});

///*///  DELETE PALETTE BY ID ///*///
app.delete('/api/v1/palettes/:id', async (request, response) => {
  const { id } = request.params;
  const deletedPalette = await database('palettes').where('id', id).select()
  
  if (deletedPalette.length) {
    await database('palettes').where('id', id).delete()
    return response.status(200).send({
      success: `Palette id ${id} deleted`
    })
  } else {
    return response.status(422).send({
      error: `Palette id ${id} not found`
    })
  }
});

module.exports = app;