const express = require('express');                                             //  Requires Express
const app = express();                                                          //  Tell the app to use Express
const path = require('path');                                                   //  Used in line 10 to tell the app where to find static files such as the HTML
const bodyParser = require('body-parser');                                      //  Enables the parsing of body data in API requests
const environment = process.env.NODE_ENV || 'development';                      //  Determines the environment to be used and sets initial value to development
const configuration = require('./knexfile')[environment];                       //  Pulls in the knexfile and passes in correct environment
const database = require('knex')(configuration);                                //  Connects database to knex

app.set('port', process.env.PORT || 3000);                                      //  Sets port initially to 3000 but allows it to be changed if in a production environment
app.use(express.static(path.join(__dirname, 'public')));                        //  Tells the app where to find static files
app.use(bodyParser.json());                                                     //  Tells the app to use body-parser for json
app.use(bodyParser.urlencoded({ extended: true }));                             //  Tells the app to use body-parser for HTML

app.listen(app.get('port'), () => {                                             //  Sets port to the port being used in line 9 and console logs that port
  console.log(`Palette Picker running on localhost:${app.get('port')}.`);
});

app.get('*', (request, response) => {
  response.redirect('https://' + request.url)
})

///*///  GET ALL PROJECTS  ///*///
app.get('/api/v1/projects', (request, response) => {                            //  GET all projects
  database('projects').select()                                                 //  Goes to postgres database and selects all projects
    .then((projects) => {                                                       //  If GET is successful, returns a 200 and the projects in json format
      response.status(200).json(projects);
    })
    .catch((error) => {                                                         //  If GET is not successful, returns a 500 and the error
      response.status(500).json({ error })                                      
    });
});

///*///  GET ALL PALETTES  ///*///
app.get('/api/v1/palettes', (request, response) => {                            //  GET all palettes (note: this call is not used in the app, but it was useful when building/testing)
  database('palettes').select()                                                 //  Goes to database and selects all palettes
    .then((palettes) => {                                                       //  If GET is sucessful, returns a 200 and all palettes in json format
      response.status(200).json(palettes);                                     
    })
    .catch((error) => {                                                         //  If GET is not successful, returns a 500 and the error
      response.status(500).json({ error })              
    });
});

///*///  CREATE NEW PROJECT  ///*///
app.post('/api/v1/projects', async (request, response) => {                     //  POST new projects
  const newProject = request.body;                                              //  Assigns variable to the request body
  const nameCheck = await database('projects').where('project_name', newProject.project_name).select();     //  Goes to database and finds if the project name already exists
  
  if (Object.keys(nameCheck).length) {                                          //  If project name exists, returns a 400 error along with message
    return response.status(400).send({ error: 'Name taken' })   
  }

  if (newProject.project_name) {                                                //  If request body includes a project name, inserts name into project
    const newId = await database('projects').returning('id').insert(newProject) 
    const objToReturn = await database('projects').select()                     //  Assigns all projects to variable

    return response.status(201).json(objToReturn)                               //  Returns all projects
  } else {
    return response.status(422).send({                                          //  If request body does not include a project name, return 422 and message
      error: "Project Name Required"
    })
  }
});

///*///  CREATE NEW PALETTE  ///*///
app.post('/api/v1/palettes', async (request, response) => {                     //  POST new palette
  const result = ['project_id', 'color_1', 'color_2', 'color_3', 'color_4', 'color_5'].every(prop => {      //  Checks if all required props have been included in body of request.  Returns true or false
    return request.body.hasOwnProperty(prop);
  })

  if(result) {                                                                  //  If required props are present, inserts new palette into database
    const newPalette = request.body;
    const newId = await database('palettes').returning('id').insert(newPalette)
    const objToReturn = await database('palettes').where('id', newId[0]).select()

    return response.status(201).json(objToReturn[0])                            //  Returns new palette with id created in database
  } else {
    return response.status(422).json({                                          //  If any required props are missing, returns a 422 with message
      error: 'You are missing properties'   
    })
  }
});

///*///  GET PALETTES BY PROJECT_ID  ///*///
app.get('/api/v1/palettes/:project_id', async (request, response) => {          //  GET palettes by project id
  const { project_id } = request.params;                                        //  Assigns project id from parameters to a variable

  await database('palettes').where('project_id', project_id).select()           //  Gets all palettes that match the passed-in project id
    .then((palettes) => {
      return response.status(200).json(palettes);                               //  Returns palettes
    })
    .catch((error) => {                                                          
      return response.status(500).json({ error })                               //  Returns a 500 with message if not found
    });
});

///*///  UPDATE PALETTE  ///*///
app.put('/api/v1/palettes', async (request, response) => {                      //  PUT (update) palette
  const { id } = request.body;                                                  //  Assigns id from request body to a variable
  const updatePalette = request.body;                                           //  Assigns all of request body to a variable

  if (id) {                                                                     //  If id has been included, uses it to find palette in database, and then updates palette
    await database('palettes').where('id', id).update(updatePalette)
    return response.status(201).json(updatePalette)                             //  Returns status 201 and updated palette information
  } else {
    return response.status(422).send({                                          //  If palette id has not been included, returns 422 error with message
      error: "Palette Id Required"
    })
  }
});

///*///  DELETE PROJECT BY ID ///*///
app.delete('/api/v1/projects/:projId', async (request, response) => {           //  DELETE project by id
  const { projId } = request.params;                                            //  Assigns project id from params to a variable
  const deletedProj = await database('palettes').where('project_id', projId).delete()     //  First, deletes palettes belonging to project in database and assigns deleted project to variable
    
  if (deletedProj) {                                                            //  If it was able to find project, then deletes project as well
    await database('projects').where('id', projId).delete()
    return response.status(200).send({                                          //  Returns status 200 with message
      success: `Project id ${projId} deleted`
    })
  } else {
    return response.status(422).send({                                          //  If there was no project with the matching id in database, returns a 422 with error
      error: `Project id ${projId} not found`
    })
  }
});

///*///  DELETE PALETTE BY ID ///*///
app.delete('/api/v1/palettes/:id', async (request, response) => {               //  DELETE palettes by palette id
  const { id } = request.params;                                                //  Assigns palette id from params to a variable
  const deletedPalette = await database('palettes').where('id', id).select()    //  Finds palette to be deleted in database and assigns to a variable
  
  if (deletedPalette.length) {                                                  //  If there is a palette to delete, deletes it
    await database('palettes').where('id', id).delete()
    return response.status(200).send({                                          //  Returns 200 with message
      success: `Palette id ${id} deleted`
    })
  } else {
    return response.status(422).send({                                          //  If there is not a palette to delete, returns 422 error with message
      error: `Palette id ${id} not found`
    })
  }
});

module.exports = app;