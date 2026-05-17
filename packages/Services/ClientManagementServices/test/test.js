require('dotenv').config({ path: '../../../../.env' });
var test = require('supertest')
var server = require('../server')
var assert = require('assert')

var clientdata={
    clientname: 'client1',
    secretkey: 'seckey'
}
var clientdata2={
    secretkey: 'newkey'
}

describe('Verify if Client CRUD is successful', function () {
    
    it('post client data', (done) => {
        test(server)
            .post('/client')
            .set('Accept','application/json')
            .send(clientdata)
            .expect(201)
            .end((err, res) => {
                if (err) return done(err);
                assert.strictEqual(res.body.success, 'Client record inserted succesfully');
                done();
            });
    })
    
    it('put group by client name', (done) => {
        test(server)
            .put('/client/client1')
            .set('Accept','application/json')
            .set('secretkey','seckey')
            .send(clientdata2)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                assert.strictEqual(res.body.success, 'client record updated succesfully');
                done();
            });
    })
    it('get client by client name', (done) => {
        test(server)
          .get('/client/client1')
          .set('Accept','application/json')
          .set('secretkey','newkey')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              assert.strictEqual(res.body[0].ClientName, 'client1');
              done();
          });
    })
    // These routes are currently commented out in server.js
    /*
    it('get all client', (done) => {
        test(server)
          .get('/client')
          .set('Accept', 'application/json')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              done();
          });
    })
    it('get token', (done) => {
        test(server)
          .get('/gettoken')
          .set('Accept', 'application/json')
          .set('secretkey','newkey')
          .expect(200)
          .end((err, res) => {
              if (err) return done(err);
              done();
          });
    })
    */
    it('delete client by client name', (done) => {
        test(server)
            .delete('/client/client1')
            .set('Accept','application/json')
            .set('secretkey','newkey')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                assert.strictEqual(res.body.success, 'client record deleted succesfully');
                done();
            });
    })
    
})
