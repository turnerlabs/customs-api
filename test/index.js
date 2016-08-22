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
                    message: 'missing field name, missing field version'
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
                    message: [
                        'authenticated and authorized',
                        'updated shipment my-shipment:test-env container my-container',
                        'triggered shipment my-shipment:test-env on barge fake-barge'
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
                    message: [
                        'authenticated and authorized',
                        'cataloged my-container v0.1.0',
                        'updated shipment my-shipment:test-env container my-container',
                        'triggered shipment my-shipment:test-env on barge fake-barge'
                    ].join(', ')
                });

                done();
            });
    });
});
