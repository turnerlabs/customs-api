/*global beforeEach, describe, it */

const expect = require('chai').expect,
    request = require('supertest'),
    nock = require('nock');

let server = require('../app.js');

function getMockData(name) {
    return `${__dirname}/mocks/${name}.json`
}

/*
 * Mixing the use of arrow functions because Mocha can't use them,
 * but I like them, so using them where I can.
 * http://mochajs.org/#arrow-functions
 */

describe('Health check', function () {
    it('should return successfully', function (done) {
        request(server)
            .get('/_hc')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});

describe('Deploy', function () {
    let testAuthToken = 'test-token',
        shipit = 'http://shipit.test.services.dmtio.net',
        catalogit = 'http://catalogit.test.services.dmtio.net',
        trigger = 'http://harbor-trigger.test.services.dmtio.net',
        path = '/deploy/my-shipment/test-env/fake-barge',
        data = {
            name: "my-container",
            image: "registry.example.com/my-container:0.1.0",
            version: "0.1.0"
        };

    beforeEach(function () {
        nock(shipit)
            .get('/v1/shipment/my-shipment/environment/test-env')
            .replyWithFile(200, getMockData('shipit'));

        nock(catalogit)
            .post('/v1/containers', {
                catalog: true,
                name: "my-container",
                image: "registry.example.com/my-container:0.1.0",
                version: "0.0.0"
            })
            .replyWithFile(409, getMockData('catalogit-conflict'))

        nock(catalogit)
            .post('/v1/containers', data)
            .replyWithFile(200, getMockData('catalogit'));

        nock(shipit)
            .put('/v1/shipment/my-shipment/environment/test-env/container/my-container', {
                image: "registry.example.com/my-container:0.1.0",
                buildToken: testAuthToken
            })
            .replyWithFile(200, getMockData('container'))

        nock(shipit)
            .put('/v1/shipment/my-shipment/environment/test-env/container/bad', {
                image: "registry.example.com/my-container:0.1.0",
                buildToken: testAuthToken
            })
            .replyWithFile(422, getMockData('bad-data'))

        nock(trigger)
            .post('/my-shipment/test-env/fake-barge', {})
            .replyWithFile(200, getMockData('trigger'));
    });

    it('should 400 when a required field is missing', function (done) {
        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send({image: "something"})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    done(err);
                }

                let body = res.body;

                expect(body).to.deep.equal({
                    code: 400,
                    message: "missing field: 'name', missing field: 'version'"
                });

                done();
            });
    });

    it('should 401 when no token provided', function (done) {
        request(server)
            .post(path)
            .send(data)
            .expect(401, done);
    });

    it('should 403 when wrong token provided', function (done) {
        let testAuthToken = 'wrong-token';

        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send(data)
            .expect(403, done);
    });

    it('should fail with 409 if container already exists', function (done) {
        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send({
                catalog: true,
                name: "my-container",
                image: "registry.example.com/my-container:0.1.0",
                version: "0.0.0"
            })
            .expect(409)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                let body = res.body;

                expect(body).to.deep.equal({
                    code: 409,
                    message: `Failed to POST http://catalogit.test.services.dmtio.net/v1/containers (Status code: 409) (Message: {\"error\":\"Container Error: There is already a combination of my-container:0.0.0. Specify unique combinations.\"})`
                });

                done();
            });
    });

    it('should fail with 422 when bad data is supplied', function (done) {
        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send({
                name: "bad",
                image: "registry.example.com/my-container:0.1.0",
                version: "0.0.0"
            })
            .expect(422)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                let body = res.body;

                expect(body).to.deep.equal({
                    code: 422,
                    message: `Failed to PUT http://shipit.test.services.dmtio.net/v1/shipment/my-shipment/environment/test-env/container/bad (Status code: 422) (Message: {\"error\":\"Container foo does not exist\"})`
                });

                done();
            });
    });

    it('should succeed', function (done) {
        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send(data)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                let body = res.body;

                expect(body).to.deep.equal({
                    code: 200,
                    message: [
                        'authenticated and authorized',
                        'updated shipment my-shipment:test-env container my-container to version 0.1.0',
                        'triggered shipment my-shipment:test-env with provider fake-barge'
                    ].join(', ')
                });

                done();
            });
    });
    
    it('should catalog container and succeed when catalog is active', function (done) {
        data.catalog = true;
        
        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send(data)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                let body = res.body;

                expect(body).to.deep.equal({
                    code: 200,
                    message: [
                        'authenticated and authorized',
                        'cataloged my-container v0.1.0',
                        'updated shipment my-shipment:test-env container my-container to version 0.1.0',
                        'triggered shipment my-shipment:test-env with provider fake-barge'
                    ].join(', ')
                });

                done();
            });
    });
});

describe('Catalog', function () {
    let testAuthToken = 'test-token',
        shipit = 'http://shipit.test.services.dmtio.net',
        catalogit = 'http://catalogit.test.services.dmtio.net',
        path = '/catalog/my-shipment/test-env/fake-barge',
        data = {
            name: "my-container",
            image: "registry.example.com/my-container:0.1.0",
            version: "0.1.0"
        };

    beforeEach(function () {
        nock(shipit)
            .get('/v1/shipment/my-shipment/environment/test-env')
            .replyWithFile(200, getMockData('shipit'));

        nock(catalogit)
            .post('/v1/containers', {
                name: "my-container",
                image: "registry.example.com/my-container:0.1.0",
                version: "0.0.0"
            })
            .replyWithFile(409, getMockData('catalogit-conflict'))

        nock(catalogit)
            .post('/v1/containers', data)
            .replyWithFile(200, getMockData('catalogit'));
    });

    it('should 400 when a required field is missing', function (done) {
        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send({image: "something"})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    done(err);
                }

                let body = res.body;

                expect(body).to.deep.equal({
                    code: 400,
                    message: "missing field: 'name', missing field: 'version'"
                });

                done();
            });
    });

    it('should 401 when no token provided', function (done) {
        request(server)
            .post(path)
            .send(data)
            .expect(401, done);
    });

    it('should 403 when wrong token provided', function (done) {
        let testAuthToken = 'wrong-token';

        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send(data)
            .expect(403, done);
    });

    it('should fail with 409 if container already exists', function (done) {
        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send({
                catalog: true,
                name: "my-container",
                image: "registry.example.com/my-container:0.1.0",
                version: "0.0.0"
            })
            .expect(409, done);
    });

    it('should succeed', function (done) {
        request(server)
            .post(path)
            .set('x-build-token', testAuthToken)
            .send(data)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                let body = res.body;

                expect(body).to.deep.equal({
                    code: 200,
                    message: [
                        'authenticated and authorized',
                        'cataloged my-container v0.1.0'
                    ].join(', ')
                });

                done();
            });
    });
});


describe('Check Image', () => {
  
  
  beforeEach(() => {
    let catalogit = 'http://catalogit.test.services.dmtio.net';
    
    nock(catalogit)
        .get('/v1/container/fake-image/fake-version')
        .reply(404, (uri, requestBody) => {
          return {code: 404, message: "does not exist"}
        });
        
    nock(catalogit)
        .get('/v1/container/real-image/real-version')
        .reply(200, (uri, requestBody) => {
          return {code: 200, message: "hey it exists"}
        });
  });
  
  it('should fail with 404 if container doesnt exist', function (done) {
      request(server)
          .get('/catalog/fake-image/fake-version')
          .expect(404)
          .end((err, res) => {
            
              if (err) {
                  return done(err);
              }

              let body = res.body;

              expect(body).to.deep.equal({
                  code: 404,
                  message: `Failed to GET http://catalogit.test.services.dmtio.net/v1/container/fake-image/fake-version (Status code: 404) (Message: {\"code\":404,\"message\":\"does not exist\"})`
              });

              done();
          });
  });
  
  
  it('should pass with 200 and not return container information', function (done) {
      request(server)
          .get('/catalog/real-image/real-version')
          .expect(200)
          .end((err, res) => {
            
              if (err) {
                  return done(err);
              }

              let body = res.body;

              expect(body).to.deep.equal({code: 200, message: "Image Exists In Catalog: real-image:real-version"});

              done();
          });
  });
})
