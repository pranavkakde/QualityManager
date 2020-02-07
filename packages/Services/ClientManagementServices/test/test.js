var test = require('supertest')
var server = require('../server')

var clientdata={
    clientname: 'client1',
    secretkey: 'seckey'
}
var clientdata2={
    secretkey: 'newkey'
}
var clientdata2={
    GroupName: 'usergroup'
}

describe('Verify if Client CRUD is successful', async () => {
    
    it('post client data', async(done) => {
        await test(server)
            .post('/client')
            .set('Accept','application/json')
            .send(clientdata)
            .expect(201)
            .expect((res)=>{res.body.message = 'Client record inserted successfully'},done())
    })
    
    it('put group by client name', async(done) => {
        test(server)
            .put('/client/client1')
            .set('Accept','application/json')
            .set('secretkey','seckey')
            .send(clientdata2)
            .expect(200)
            .expect((res)=>{res.body.message = 'Client record updated successfully'},done())
    })
    it('get client by client name', async(done) => {
        await test(server)
          .get('/client/client1')
          .set('Accept','application/json')
          .set('secretkey','newkey')
          .expect(200)
          .expect((res)=>{
            res.body.clientname = 'client1';
          }, done())
    })
    it('get all client', async(done) => {
        await test(server)
          .get('/client')
          .set('Accept', 'application/json')
          .expect(200,done())
    })
    it('get token', async (done) => {
        await test(server)
          .get('/gettoken')
          .set('Accept', 'application/json')
          .set('secretkey','newkey')
          .expect(200,done())
    })
    it('delete client by client name', async(done) => {
        await test(server)
            .delete('/client/client1')
            .set('Accept','application/json')
            .set('secretkey','newkey')
            .expect(200)
            .expect((res)=>{res.body.message = 'Client record deleted successfully'},done())
    })
    
})
