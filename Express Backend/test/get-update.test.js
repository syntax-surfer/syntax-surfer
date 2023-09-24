const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server'); 
const expect = chai.expect;
const map = new Map();


chai.use(chaiHttp);

describe('GET /getUpdate', () => {
  beforeEach(() => {
    // Mock the map for testing purposes
    map.set('validBaseURL', {
      base_url: 'validBaseURL',
      query: 'testQuery',
      status: 'pending',
      message: '',
      origin: '',
      content: '',
    });
  });

  afterEach(() => {
    // Clear the map after each test
    map.clear();
  });

  it('should return a 400 status code when baseURL is missing', async () => {
    const res = await chai.request(app).get('/getUpdate');

    expect(res).to.have.status(400);
    expect(res.body).to.deep.equal({ error: 'Request must contain baseURL.' });
  });

  it('should return a 500 status code when baseURL is not in the map', async () => {
    const res = await chai
      .request(app)
      .get('/getUpdate')
      .query({ baseURL: 'nonexistentBaseURL' });

    expect(res).to.have.status(500);
    expect(res.body).to.deep.equal({ error: 'baseURL is not in the map.' });
  });

//   it('should return a 200 status code and the corresponding data when baseURL is in the map', async () => {
//     const res = await chai
//       .request(app)
//       .get('/getUpdate')
//       .query({ baseURL: 'validBaseURL' });

//     expect(res).to.have.status(200);
//     expect(res.body).to.deep.equal(mockMap.get('validBaseURL'));
//   });
});