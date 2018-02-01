process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');
const configuration = require('../knexfile')['test'];
const knex = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it('should return the homepage', () => {
    return chai.request(server)
    .get('/')
    .then(response => {
      response.should.have.status(200);
      response.should.be.html;
    })
    .catch(error => {
      throw error;
    })
  })

  it('should return a 404 error for a route that does not exist', () => {
    return chai.request(server)
    .get('/sad')
    .then(response => {
      response.should.have.status(404);
    })
    .catch(error => {
      throw error;
    })
  })
})

describe('API Routes', () => {
  beforeEach((done) => {
    knex.seed.run()
    .then(() => {
      done();
    })
  })

  it('should get all projects', () => {
    return chai.request(server)
    .get('/api/v1/projects')
    .then(response => {
      response.should.have.status(200);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(3);
      response.body[0].should.have.property('project_name');
      response.body[0].project_name.should.equal('Linked List');
      response.body[1].should.have.property('project_name');
      response.body[1].project_name.should.equal('Swapi Box');
      response.body[2].should.have.property('project_name');
      response.body[2].project_name.should.equal('Movie Tracker');
    })
    .catch(error => {
      throw error;
    })
  })

  it('should get all palettes with certain project_ids', () => {
    var id;

    return chai.request(server)
    .get('/api/v1/projects')
    .then(response => {
      id = response.body[0].id;
    })
    .then(response => {
      return chai.request(server)
      .get(`/api/v1/palettes/${id}`)
      .then(response => {
        response.should.have.status(200);
        response.should.be.json;
        response.body.should.be.a('array');
        response.body.length.should.equal(5);
        response.body[0].should.have.property('palette_name');
        response.body[0].should.have.property('project_id');
        response.body[0].should.have.property('color_1');
        response.body[0].should.have.property('color_2');
        response.body[0].should.have.property('color_3');
        response.body[0].should.have.property('color_4');
        response.body[0].should.have.property('color_5');
        response.body[0].palette_name.should.equal('pastels');
        response.body[0].project_id.should.equal(id);
        response.body[0].color_1.should.equal('#ffe6d0');
        response.body[0].color_2.should.equal('#fffde3');
        response.body[0].color_3.should.equal('#c9e6d2');
        response.body[0].color_4.should.equal('#abe1fa');
        response.body[0].color_5.should.equal('#f9c9de');
      })
      .catch(error => {
        throw error;
      })
    })
  })

  it('should create a new project and return all projects', () => {
    return chai.request(server)
    .post('/api/v1/projects')
    .send({
      project_name: 'New Project'
    })
    .then(response => {
      response.should.have.status(201);
      response.should.be.json;
      response.body.should.be.a('array');
      response.body.length.should.equal(4);
      response.body[3].should.have.property('project_name');
      response.body[3].project_name.should.equal('New Project');
    })
    .catch(error => {
      throw error;
    })
  })

  it('should send an error message when a project name is already taken', () => {
    return chai.request(server)
    .post('/api/v1/projects')
    .send({
      project_name: 'Linked List'
    })
    .then(response => {
      response.should.have.status(400)
    })
    .catch(error => {
      throw error;
    })
  })

  /////////////////////////////////////
  it('should return a 422 error if project name is not included', () => {
    return chai.request(server)
    .post('/api/v1/projects')
    .send({
      project_name: null
    })
    .then(response => {
      response.should.have.status(422);
    })
    .catch(error => {
      throw error;
    })
  })
  ////////////////////////////////////

  it('should create a new palette', () => {
    let id;

    return chai.request(server)
    .get('/api/v1/projects')
    .then(response => {
      id = response.body[0].id;
    })
    .then(response => {
      return chai.request(server)
      .post('/api/v1/palettes')
      .send({
        project_id: id,
        color_1: '#fe39af',
        color_2: '#2338fa',
        color_3: '#ab8ed1',
        color_4: '#d7d9a0',
        color_5: '#39a0d0'
      })
      .then(response => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.be.a('object');
        response.body.should.have.property('id');
        response.body.should.have.property('project_id');
        response.body.should.have.property('color_1');
        response.body.should.have.property('color_2');
        response.body.should.have.property('color_3');
        response.body.should.have.property('color_4');
        response.body.should.have.property('color_5');
        response.body.project_id.should.equal(id);
        response.body.color_1.should.equal('#fe39af');
        response.body.color_2.should.equal('#2338fa');
        response.body.color_3.should.equal('#ab8ed1');
        response.body.color_4.should.equal('#d7d9a0');
        response.body.color_5.should.equal('#39a0d0');
      })
      .catch(error => {
        throw error;
      })
    })
  })

  it('should return a 422 error if certain properties are not included', () => {
    return chai.request(server)
    .post('/api/v1/palettes')
    .send({
      project_id: undefined,
      color_1: '#fe39af',
      color_2: '#2338fa',
      color_3: '#ab8ed1',
      color_4: '#d7d9a0',
      color_5: '#39a0d0'
    })
    .then(response => {
      response.should.have.status(422);
    })
    .catch(error => {
      throw error;
    })
  })

  it('should update a palette', () => {
    let id;

    return chai.request(server)
    .get('/api/v1/palettes')
    .then(response => {
      id = response.body[0].id;
    })
    .then(response => {
      return chai.request(server)
      .put('/api/v1/palettes')
      .send({
        id: id,
        palette_name: 'Ice Cream',
        color_1: '#fe39cf',
        color_2: '#2338f2',
        color_3: '#ab8ed1',
        color_4: '#d329a0',
        color_5: '#39a45a'
      })
      .then(response => {
        response.should.have.status(201);
        response.should.be.json;
        response.body.should.be.a('object');
        response.body.should.have.property('id');
        response.body.should.have.property('palette_name');
        response.body.should.have.property('color_1');
        response.body.should.have.property('color_2');
        response.body.should.have.property('color_3');
        response.body.should.have.property('color_4');
        response.body.should.have.property('color_5');
        response.body.id.should.equal(id);
        response.body.palette_name.should.equal('Ice Cream');
        response.body.color_1.should.equal('#fe39cf');
        response.body.color_2.should.equal('#2338f2');
        response.body.color_3.should.equal('#ab8ed1');
        response.body.color_4.should.equal('#d329a0');
        response.body.color_5.should.equal('#39a45a');
      })
    })
    .catch(error => {
      throw error;
    })
  })

  it('should return a 422 error if id is omitted when attempting to update a palette', () => {
    return chai.request(server)
    .put('/api/v1/palettes')
    .then(response => {
      response.should.have.status(422);
      response.should.be.json;
    })
    .catch(error => {
      throw error;
    })
  })

  it('should delete a project', () => {
    let id;

    return chai.request(server)
    .get('/api/v1/projects')
    .then(response => {
      id = response.body[0].id;
    })
    .then(response => {
      return chai.request(server)
      .delete(`/api/v1/projects/${id}`)
      .then(response => {
        response.should.have.status(200);
      })
    })
    .catch(error => {
      throw error;
    })
  })

  it('should return a 422 error if project id is not found', () => {
    return chai.request(server)
    .delete('/api/v1/projects/99999999')
    .then(response => {
      response.should.have.status(422);
    })
    .catch(error => {
      throw error;
    })
  })

  it('should delete a palette', () => {
    let id;

    return chai.request(server)
    .get('/api/v1/palettes')
    .then(response => {
      id = response.body[0].id;
    })
    .then(response => {
      return chai.request(server)
      .delete(`/api/v1/palettes/${id}`)
      .then(response => {
        response.should.have.status(200);
      })
    })
    .catch(error => {
      throw error;
    })
  })

  it('should return a 422 error if id is not found', () => {
    return chai.request(server)
    .delete('/api/v1/palettes/99999999')
    .then(response => {
      response.should.have.status(422);
    })
    .catch(error => {
      throw error;
    })
  })

})

