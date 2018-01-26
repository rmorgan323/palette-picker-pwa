process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');
const configuration = require('../knexfile')['test'];
const knex = require('knex')(configuration);

chai.use(chaiHttp);

describe('Client Routes', () => {
  it.skip('should', () => {

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
  })

  it('should get all palettes with certain project_ids', () => {
    let id;

    return chai.request(server)
    .get('/api/v1/projects')
    .then(response => {
      id = response.body[0].id;
    })
    .then(() => {
      return chai.request(server)
      .get('/api/v1/palettes/1')
      .then(response => {
        console.log(response.body)
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
        response.body[0].project_id.should.equal(1);
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

  it.skip('should create a new project and return all projects', () => {
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
  })

  it.skip('should create a new palette', async () => {
    await chai.request(server)
    .post('/api/v1/palettes')
    .send({
      project_id: '1',
      color_1: '#fe39af',
      color_2: '#2338fa',
      color_3: '#ab8ed1',
      color_4: '#d7d9a0',
      color_5: '#39a0d0'
    })
    .then(response => {
      response.should.have.status(201);
      response.should.be.json;
      // response.body.should.be.a('object');
      response.body.length.should.equal(1);
      // response.body.should.have.property('id');
      response.body.should.have.property('project_id');
      response.body.should.have.property('color_1');
      response.body.should.have.property('color_2');
      response.body.should.have.property('color_3');
      response.body.should.have.property('color_4');
      response.body.should.have.property('color_5');
    })
    .catch(error => {
      throw error;
    })
  })
})