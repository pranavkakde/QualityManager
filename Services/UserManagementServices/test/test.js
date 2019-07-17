var test = require('supertest')
var server = require('../server')

var userdata={
    //UserId: 1,
    UserName: 'test user',
    Password: 'testpass',
    GroupId: 1
}
var userdata2={
    //UserId: 1,
    UserName: 'testnew',
    Password: 'testpass2',
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

describe('Verify if Group CRUD is successful', () => {
    
    it('post group by group id', (done) => {
        test(server)
            .post('/group')
            .set('Accept','application/json')
            .send(groupuserdata)
            .expect(200)
            .expect((res)=>{res.body.message = 'Group record inserted successfully'},done())
    })
    it('post group 2 by group id', (done) => {
        test(server)
            .post('/group')
            .set('Accept','application/json')
            .send(groupadmindata)
            .expect(200)
            .expect((res)=>{res.body.message = 'Group record inserted successfully'},done())
    })
    it('put group by group id', (done) => {
        test(server)
            .put('/group/1')
            .set('Accept','application/json')
            .send(groupuserdata2)
            .expect(200)
            .expect((res)=>{res.body.message = 'User record updated successfully'},done())
    })
    it('get group by group id', (done) => {
        test(server)
          .get('/group/1')
          .set('Accept','application/json')
          .expect(200)
          .expect((res)=>{
            res.body.groupid = groupuserdata.GroupId;
            res.body.groupname = groupuserdata.GroupName;
          }, done())
    })
    it('get all groups', (done) => {
        test(server)
          .get('/groups')
          .set('Accept', 'application/json')
          .expect(200,done())
    })
    it('delete group by group id', (done) => {
        test(server)
            .delete('/group/1')
            .set('Accept','application/json')
            .expect(200)
            .expect((res)=>{res.body.message = 'User record deleted successfully'},done())
    })
})

describe('Verify if User CRUD is successful', () => {
    
    it('post user by user id', (done) => {
        test(server)
            .post('/user')
            .set('Accept','application/json')
            .send(userdata)
            .expect(200)
            .expect((res)=>{res.body.message = 'User record inserted successfully'},done())
    })
    it('post user 2 by user id', (done) => {
        test(server)
            .post('/user')
            .set('Accept','application/json')
            .send(userdata3)
            .expect(200)
            .expect((res)=>{res.body.message = 'User record inserted successfully'},done())
    })
    it('put user by user id', (done) => {
        test(server)
            .put('/user/1')
            .set('Accept','application/json')
            .send(userdata)
            .expect(200)
            .expect((res)=>{res.body.message = 'User record updated successfully'},done())
    })
    it('get user by user id', (done) => {
        test(server)
          .get('/user/1')
          .set('Accept','application/json')
          .expect(200)
          .expect((res)=>{
            res.body.userid = userdata.UserId;
            res.body.username = userdata.UserName;
            res.body.password = userdata.Password;
            res.body.groupid = userdata.GroupId;
          }, done())
    })
    it('get all users by user id', (done) => {
        test(server)
          .get('/users')
          .set('Accept', 'application/json')
          .expect(200,done())          
    })
    it('delete user by user id', (done) => {
        test(server)
            .delete('/user/1')
            .set('Accept','application/json')
            .expect(200)
            .expect((res)=>{res.body.message = 'User record deleted successfully'},done())
    })
})