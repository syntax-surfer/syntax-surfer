const chai = require('chai');
const chaiHttp = require('chai-http');
const { createServer } = require('http');
const app = require('../server'); 
const expect = chai.expect;

chai.use(chaiHttp);

const server = createServer(app);

describe('POST /search', () => {
    before((done) => {
        server.listen(3000, () => {
          console.log('Server is running on port 3000 for testing');
          done();
        });
      });

  it('should return a 400 status code when baseURL and query are missing', async () => {
    const res = await chai.request(app).post('/search');

    expect(res).to.have.status(400);
    expect(res.body).to.deep.equal({ error: 'Domain and query are required parameters.' });
  });

//   it('should return a 200 status code and success message when valid baseURL and query are provided', async () => {
//     const res = await chai
//       .request(app)
//       .post('/search')
//       .query({ baseURL: 'https://example.com', query: 'example' });

//     expect(res).to.have.status(200);
//     expect(res.body).to.deep.equal({ message: 'Success' });
//   });

//   it('should return a specific error message when the scraper function fails', async () => {
//     // Mock the scrapeContent function to simulate a failure
//     const originalScrapeContent = require('../scrapeContent'); // Replace with the actual path
//     const mockScrapeContent = sinon.stub(originalScrapeContent);

//     mockScrapeContent.rejects(new Error('Web Scraper error'));

//     const res = await chai
//       .request(app)
//       .post('/search')
//       .query({ baseURL: 'https://example.com', query: 'example' });

//     expect(res).to.have.status(500); // Adjust the expected status code as needed
//     expect(res.body).to.deep.equal({ error: 'Web Scraper error' });

//     // Restore the original scrapeContent function
//     mockScrapeContent.restore();
//   });

  after((done) => {
    server.close(() => {
      console.log('Server closed after testing');
      done();
    });
  });

  // Add more test cases for different scenarios, such as testing the map state, API responses, etc.
});
