var app = require('../../../app');
var request = require('supertest')(app);
var superagent = require('superagent');
var agent = superagent.agent();

describe('Модуль users', function() {
  describe('Очистка коллекции пользователей (clearUsers)', function() {
    context('Попытка очистки не авторизованным пользователем', function() {
      it('Возвращается отказ', function(done) {
        var req = request.post('/users/clearUsers');
        agent.attachCookies(req);
        req
          .send({email: "user1@testero"})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            agent.saveCookies(res);
            
            res.body.status.should.equal(false, res.body.msg);

            done();
          });
      });
    });
    
    context('Попытка очистки не администратором', function() {
      before(function(done) {
        var admin1 = {
          email: "admin1@testero",
          password: "admin1",
          passwordDuplicate: "admin1"
        };
        var req = request.post('/users/registerAdministrator');
        agent.attachCookies(req);
        req
          .send(admin1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            
            agent.saveCookies(res);
            
            res.body.status.should.equal(true, res.body.msg);
            
            var user1 = {
              email: "user1@testero",
              password: "user1",
              passwordDuplicate: "user1"
            };
            var req = request.post('/users/registerUser');
            agent.attachCookies(req);
            req
              .send(user1)
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .end(function(err, res) {
                if (err) {
                  throw err;
                }

                agent.saveCookies(res);
                
                res.body.status.should.equal(true);
                
                var req = request.post('/users/logout');
                agent.attachCookies(req);
                req
                  .set('X-Requested-With', 'XMLHttpRequest')
                  .expect('Content-Type', /application\/json/)
                  .expect(200)
                  .end(function (err, res) {
                    if (err) {
                      throw err;
                    }

                    agent.saveCookies(res);
                    
                    res.body.status.should.equal(true, res.body.msg);
                    
                    var req = request.post('/users/login');
                    agent.attachCookies(req);
                    req
                      .send({email: "user1@testero", password: "user1"})
                      .set('X-Requested-With', 'XMLHttpRequest')
                      .expect('Content-Type', /application\/json/)
                      .expect(200)
                      .end(function (err, res) {
                        if (err) {
                          throw err;
                        }

                        agent.saveCookies(res);

                        res.body.status.should.equal(true, res.body.msg);

                        done();
                      });
                  });
            });
        });
      });
      
      it('Возвращается отказ. Количество пользователей не изменилось.', function(done) {
        var req = request.post('/users/clearUsers');
        agent.attachCookies(req);
        req
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            agent.saveCookies(res);
            
            res.body.status.should.equal(false, res.body.msg);
            
            request
              .get('/users/users/')
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .end(function(err, res) {
                if (err) {
                  throw err;
                }

                res.body.status.should.equal(true);
                res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(2);

                done();
            });
          });
      });
    });
    
    context('Очистка администратором', function() {
      before(function(done) {
        var req = request.post('/users/logout');
        agent.attachCookies(req);
        req
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            agent.saveCookies(res);

            res.body.status.should.equal(true, res.body.msg);
            
            var req = request.post('/users/login');
            agent.attachCookies(req);
            req
              .set('X-Requested-With', 'XMLHttpRequest')
              .send({email: "admin1@testero", password: "admin1"})
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .end(function (err, res) {
                if (err) {
                  throw err;
                }

                agent.saveCookies(res);

                res.body.status.should.equal(true, res.body.msg);
                
                done();
              });
            });
      });
      
      it('Возвращается успех. В коллекции пользователей нуль', function(done) {
        var req = request.post('/users/clearUsers');
        agent.attachCookies(req);
        req
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .end(function (err, res) {
            if (err) {
              throw err;
            }

            agent.saveCookies(res);
            
            res.body.status.should.equal(true, res.body.msg);
            
            request
              .get('/users/users/')
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .end(function(err, res) {
                if (err) {
                  throw err;
                }

                res.body.status.should.equal(true);
                res.body.users.should.be.an.instanceOf(Array).and.have.lengthOf(0);

                done();
            });
          });
      });
    });
  });
});
