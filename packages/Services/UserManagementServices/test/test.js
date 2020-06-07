var test = require('supertest')
var server = require('../server')
var assert = require("assert")

var userdata={
    //UserId: 1,
    UserName: 'test user',
    Password: 'testpass',
    GroupId: 1
}
var userdata3={
    //UserId: 2,
    UserName: 'user2',
    Password: 'pass2',
    GroupId: 2
}
var groupuserdata={
    //GroupId: 1,
    GroupName: 'user'
}
var groupadmindata={
    //GroupId: 1,
    GroupName: 'admin'
}
var groupuserdata2={
    //GroupId: 1,
    GroupName: 'usergroup'
}
var groupid = 0
var userid = 0
/*describe('Verify if Group CRUD is successful', () => {
    
    it('post group by group id',  (done) => {
         test(server)
            .post('/group')
            .set('Accept','application/json')
            .send({"groupname": "admin"})
            .expect(201)
            .end(function (res){console.log(res);assert(res.body.message,'Group record inserted successfully');done()})
            //.end(done())
    })
    it('get all groups',  (done) => {
         test(server)
          .get('/groups')
          .set('Accept', 'application/json')
          .expect(200)
          .expect((res)=>{ 
              console.log(res);
              groupid = res.body[0].GroupId; 
              console.log(`group id inserted ${groupid}`); 
            })
        .end(done())
    })
    it('put group by group id', (done) => {
        console.log(`test ${groupid}`)
         test(server)
            .put(`/group/${groupid}`)
            .set('Accept','application/json')
            .send({"groupname": "admin1"})
            //.expect(200)
            //.expect((res)=>{assert(res.body.message,'Group record updated successfully')})
            .end(done())
    })    
    it('get group by group id',  (done) => {
         test(server)
          .get(`/group/${groupid}`)
          .set('Accept','application/json')
          .expect(200)
          .expect((res)=>{
            console.log(res.body);
            assert(res.body.groupname,groupuserdata2.GroupName)
          })
          .end(done())
    })    
    it('delete group by group id',  (done) => {
         test(server)
            .delete(`/group/${groupid}`)
            .set('Accept','application/json')
            .expect(200)
            .end((res)=>{assert(res.body.message, 'Group record deleted successfully');done()})
            //.end(done())
    })
})*/

describe('Verify if User CRUD is successful', () => {
    
    it('post user by user id', (done) => {
         test(server)
            .post('/user')
            .set('Accept','application/json')
            .send(userdata)
            .expect(200)
            .end((res)=>{res.body.message.should('User record inserted successfully');done();})
    })
    it('get all users by user id',  (done) => {
         test(server)
          .get('/users')
          .set('Accept', 'application/json')
          .expect(200)
          .end((res)=>{ 
              userid = res.body[0].UserId;
              console.log(`user id inserted ${userid}`); 
              done();
            })          
    })
    it('put user by user id', (done) => {
         test(server)
            .put(`/user/${userid}`)
            .set('Accept','application/json')
            .send(userdata3)
            .expect(200)
            .end((res)=>{res.body.message.should('User record updated successfully'); done()})
    })
    it('get user by user id',  (done) => {
         test(server)
          .get(`/user/${userid}`)
          .set('Accept','application/json')
          .expect(200)
          .end((res)=>{
            console.log(res.body); done();
            })
    })    
    it('delete user by user id', (done) => {
         test(server)
            .delete(`/user/${userid}`)
            .set('Accept','application/json')
            .expect(200)
            .end((res)=>{res.body.message.should('User record deleted successfully');done()})
    })
})