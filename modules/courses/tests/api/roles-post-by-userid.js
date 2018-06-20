"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const should = require('should')
const supertest = require('supertest')

const coursesDB = require('../../db/courses')
const rolesDB = require('../../db/roles')
const usersDB = require('../../../users/db')

describe('/courses/assignRole', function() {
  /** @type {supertest.SuperTest<supertest.Test>} */
  let agent
  /** @type {express.Express} */
  let app

  before(function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    return mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true})
      .then(client => {
        return client.db(dbName)
      })
      .then(db => {
        coursesDB.setup(db)
        rolesDB.setup(db)
        usersDB.setup(db)
  
        app = require('../../../../app')(db)
        app.use(cookieParser())
        
        agent = supertest.agent(app)

        return coursesDB.clearCourses()
          .then(() => {
            return rolesDB.clearRoles()
          })
          .then(() => {
            return usersDB.clearUsers()
          })
      })
  })

  describe('Назначение роли (assignRole)', function() {
    let admin = {
      email: "admin@admin",
      password: "admin"
    }
    let user1 = {
      email: "user1@user1",
      password: "user1"
    }
    let user2 = {
      email: "user2@user2",
      password: "user2"
    }
    let adminId
    let userId1
    let userId2

    before('Добавление необходимых пользователей в БД.', function() {
      return usersDB.registerUser({
        email: "admin@admin",
        password: "admin",
        isAdministrator: true,
        registeredBy: "admin@admin"
      })
      .then(admin => {
        adminId = admin.id

        return usersDB.registerUser({
          email: user1.email,
          password: user1.password,
          isAdministrator: false,
          registeredBy: "admin@admin"
        })
      })
      .then(user1 => {
        userId1 = user1.id

        return usersDB.registerUser({
          email: "user2@user2",
          password: "user2",
          isAdministrator: false,
          registeredBy: "admin@admin"
        })
      })
      .then(user2 => {
        userId2 = user2.id
      })
    })      
    
    context('Назначение роли teacher администратором', function() {
      before('Вход под именем администратора', function() {
        return agent
          .post('/users/users/' + adminId + '/auth')
          .send({password: admin.password})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)
          })
      })
      
      it('Возвращается успех: user1 имеет роль teacher', function() {
        return agent
          .post('/courses/assignRole')
          .send({user_id: userId1, role: 'teacher'})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)
            return rolesDB.getRolesByUserId(userId1)
              .then(roles => {
                roles.should.containEql('teacher');
              })
          })
      })

      after(function() {
        return agent
          .delete('/users/users/' + adminId + '/auth')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)
          })
      })
    })
    
    context('Назначение роли teacher другим teacher', function() {
      before('Назначение user1 роли teacher. Вход под именем user1', function() {
        return rolesDB.assignRole(userId1, "teacher")
          .then(() => {
            return agent
              .post('/users/users/' + userId1 + '/auth')
              .send({password: user1.password})
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .then(res => {
                res.body.status.should.equal(true, res.body.msg)
              })
          })
      })
      
      it('Возвращается успех: user2 имеет роль teacher', function() {
        return agent
          .post('/courses/assignRole')
          .send({user_id: userId2, role: 'teacher'})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)

            return rolesDB.getRolesByUserId(userId2)
              .then(roles => {
                roles.should.containEql('teacher');
              })
          })
      })

      after('Выход пользователя user1', function() {
        return agent
          .delete('/users/users/' + userId1 + '/auth')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)
          })
      })
    })
    
    context('Назначение роли teacher пользователем без ролей', function() {
      before('Очистка ролей и вход под именем user1', function() {
        return rolesDB.clearRoles()
          .then(() => {
            return agent
              .post('/users/users/' + userId1 + '/auth')
              .send({password: user1.password})
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .then(res => {
                res.body.status.should.equal(true, res.body.msg)
              })
          })
      })
      
      it('Возвращается отказ: user2 не получает роль teacher', function() {
        return agent
          .post('/courses/assignRole')
          .send({user_id: userId2, role: 'teacher'})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(false, res.body.msg)

            return rolesDB.getRolesByUserId(userId2)
              .then(roles => {
                  roles.should.be.an.instanceOf(Array).and.have.lengthOf(0)
              })
          })
      })
    })
    
    context('Назначение роли teacher пользователем с ролью student', function() {
      before('Вход под именем user1 и назначение ему роли студента', function() {
        return rolesDB.assignRole(userId1, "student")
        .then(() => {
          return agent
          .post('/users/users/' + userId1 + '/auth')
          .send({password: user1.password})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)
          });
        });
      });
      
      it('Возвращается отказ: user2 не получает роль teacher', function() {
        return agent.post('/courses/assignRole')
          .send({user_id: userId1, role: 'teacher'})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(false, res.body.msg)

            return rolesDB.getRolesByEmail(user2.email)
              .then(roles => {
                roles.should.not.containEql("student")
              }); 
          });
      });

      after(function() {
        return agent
          .delete('/users/users/' + adminId + '/auth')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg);
          })
      })
    });
    
    context('Назначение роли student администратором.', function() {
      before('Вход под именем администратора.', function() {
        return agent
        .post('/users/users/' + adminId + '/auth')
        .send({password: admin.password})
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        });
      });
      
      it('Возвращается успех: user2 получил роль student', function() {
        return agent
          .post('/courses/assignRole')
          .send({user_id: userId2, role: 'student'})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)

            return rolesDB.getRolesByUserId(userId2)
              .then(roles => {
                roles.should.containEql("student")
              })
        })
      })

      after(function() {
        return agent
        .delete('/users/users/' + adminId + '/auth')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .then(res => {
          res.body.status.should.equal(true, res.body.msg)
        })
      })
    })
    
    context('Назначение роли student другим пользователем', function() {
      before('Вход под именем user1', function() {
        return agent
          .post('/users/users/' + userId1 + '/auth')
          .send({password: user1.password})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)
          })
      })
      
      it('Возвращается отказ: user2 не получил роль student', function() {
        return agent
          .post('/courses/assignRole')
          .send({user_id: userId2, role: 'student'})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(false, res.body.msg)

            return rolesDB.getRolesByUserId(userId1)
              .then(roles => {
                roles.should.not.containEql("student")
              })
        })
      })
    })
    
    context('Назначение роли student самим пользователем без ролей', function() {
      before('Очистка ролей и вход под именем user1', function() {
        return rolesDB.clearRoles()
          .then(() => {
            return agent
              .post('/users/users/' + userId1 + '/auth')
              .send({password: user1.password})
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .then(res => {
                res.body.status.should.equal(true, res.body.msg)
              })
          })
      })
      
      it('Возвращается успех: user1 получил роль student', function() {
        return agent
          .post('/courses/assignRole')
          .send({user_id: userId1, role: 'student'})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)

            rolesDB.getRolesByUserId(userId1)
              .then(roles => {
                roles.should.containEql("student")
              })
        })
      })

      after(function() {
        return agent
          .delete('/users/users/' + userId1 + '/auth')
          .set('Accept', 'application/json')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)
          })
      })
    });

    context('Назначение роли student самим пользователем с ролью teacher', function() {
      before('Очистка ролей, назначение роли teacher и вход под именем user1', function() {
        return rolesDB.clearRoles()
          .then(() => {
            return rolesDB.assignRole(userId1, 'teacher')
          })
          .then(() => {
            return agent
              .post('/users/users/' + userId1 + '/auth')
              .send({password: user1.password})
              .set('X-Requested-With', 'XMLHttpRequest')
              .expect('Content-Type', /application\/json/)
              .expect(200)
              .then(res => {
                res.body.status.should.equal(true, res.body.msg)
              })
          })
      })
      
      it('Возвращается успех: user1 получил роль student', function() {
        return agent
          .post('/courses/assignRole')
          .send({user_id: userId1, role: 'student'})
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)

            rolesDB.getRolesByUserId(userId1)
              .then(roles => {
                roles.should.containEql("student")
              })
        })
      })

      after(function() {
        return agent
          .delete('/users/users/' + userId1 + '/auth')
          .set('Accept', 'application/json')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg)
          })
      })
    });
    
    context('Назначение роли без входа в систему', function() {
      it('Возвращается отказ. user1 не получил роль student', function() {
        return agent
          .post('/courses/assignRole')
          .send({user_id: userId1, role: 'student'})
          .set('Accept', 'application/json')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(false, res.body.msg);
            
            rolesDB.getRolesByUserId(userId1)
              .then(roles => {
                  if (!!roles) {
                    roles.should.not.containEql("student");
                  }
              })
        })
      });
    });
    
    afterEach('Очистка всех ролей после теста.', function() {
      return rolesDB.clearRoles()
    })
  })

  after('Очистка пользователей', function() {
    return usersDB.clearUsers()
  })
})
