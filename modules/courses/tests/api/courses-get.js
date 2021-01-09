"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const supertest = require('supertest')

const coursesDB = require('../../db/courses')

describe('GET /courses/courses', function () {
  let agent
  let app

  before(function() {
    const mongoHost = config.db.host || 'localhost'
    const mongoPort = config.db.port || '27017'
    const dbName = config.db.name || 'testero-testing'
    const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

    return mongodb.MongoClient.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
      .then(client => {
        const db = client.db(dbName)

        /**
         * @typedef {Object} Settings
         * @property {mongodb.Db} settings.mongoDBConnection
         * @type {Settings} settings
         */
        const settings = {
          mongoDBConnection: db
        }

        coursesDB.setup(settings)

        app = require('../../../../app')(settings)
        app.use(cookieParser())
        
        agent = supertest.agent(app)
      })
      .then(() => {
        return coursesDB.clear()
      })
  })
  
  describe('Список всех курсов (GET /courses/courses)', function() {
    context('Список пуст', function() {
      it('Возвращается массив длины нуль', function(done) {
        agent
        .get('/courses/courses/')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);
          res.body.courses.should.be.an.instanceOf(Array).and.have.lengthOf(0);
          
          done();
        });
      });
    });
    
    context('В списке один курс', function() {
      before(function() {
        return coursesDB.add({title: 'Первый курс', author: null})
      });
      
      it('Возвращается массив длины единица', function (done) {
        agent
        .get('/courses/courses/')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);
          res.body.courses.should.be.an.instanceOf(Array).and.have.lengthOf(1);
          res.body.courses[0].title.should.equal('Первый курс', res.body.msg);
          
          done();
        });
      });
    });
    
    context('В списке два курса', function() {
      before(function() {
        return coursesDB.add({title: 'Второй курс', author: null})
      });
      
      it('Возвращается массив длины два', function (done) {
        agent
        .get('/courses/courses/')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);
          res.body.courses.should.be.an.instanceOf(Array).and.have.lengthOf(2);
          
          done();
        });
      });
      
      after(function() {
        return coursesDB.clear()
      })
    })
  })
  
  describe('Получение курса по ID', function() {
    context('Список курсов пуст', function() {
      it('Попытка получить курс по некоторому ID', function() {
        return agent
          .get('/courses/courses/5963ce98fb28ee7d3fb4f6a0')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(false, res.body.msg);
          });
      });
    });
    
    context('Есть два курса', function() {
      var ID1, ID2;
      before(function() {
        return coursesDB.add({title: 'Первый курс', author: null})
          .then(course => {
            ID1 = course.id;
            return coursesDB.add({title: 'Второй курс', author: null})
          })
          .then(course => {
            ID2 = course.id;
          })
      })
    
      it('Попытка получить курс по недействительному ID', function() {
        return agent
          .get('/courses/courses/5963ce98fb28ee7d3fb4f6a0')
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(false, res.body.msg);
          });
      });
      
      it('Получение первого курса по его ID', function() {
        return agent
          .get('/courses/courses/' + ID1)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg);
            res.body.course.should.not.equal(undefined);
            res.body.course.id.should.equal(ID1);
            res.body.course.should.have.property('title');
          });
      });
      
      it('Получение второго курса по его ID', function() {
        return agent
          .get('/courses/courses/' + ID2)
          .set('X-Requested-With', 'XMLHttpRequest')
          .expect('Content-Type', /application\/json/)
          .expect(200)
          .then(res => {
            res.body.status.should.equal(true, res.body.msg);
            res.body.course.should.not.equal(undefined);
            res.body.course.id.should.equal(ID2);
            res.body.course.should.have.property('title');
          });
      });
    });
  });
  
  describe('Поиск курсов по названию (GET /courses/courses/?title=title', function() {
    context('Нет ни одного курса', function() {
      before(function() {
        return coursesDB.clear();
      });
      
      it('Курс не найден', function(done) {
        agent
        .get('/courses/courses/?title=Any')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(false, res.body.msg);
          res.body.should.not.have.property('courses');
          
          done();
        });
      });
    });
    
    context('Есть один курс, но ищем другой', function() {
      before(function() {
        return coursesDB.add({title: 'First', author: null})
      });
      
      it('Курс не найден', function(done) {
        agent
        .get('/courses/courses/?title=Second')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(false, res.body.msg);
          res.body.should.not.have.property('courses');
          
          done();
        });
      });
    });
    
    context('Есть один курс, ищем именно его', function() {
      it('Курс найден', function(done) {
        agent
        .get('/courses/courses/?title=First')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);
          res.body.courses.length.should.equal(1);
          res.body.courses[0].title.should.equal('First');
          
          done();
        });
      });
    });
    
    context('Есть два курса с разными названиями', function() {
      before(function() {
        return coursesDB.add({title: 'Second', author: null})
      })

      it('Курс найден', function(done) {
        agent
        .get('/courses/courses/?title=Second')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          res.body.status.should.equal(true, res.body.msg);
          res.body.courses.length.should.equal(1);
          res.body.courses[0].title.should.equal('Second');
          
          done();
        });
      });
    });
    
    context('Есть два курса с одинаковыми названиями', function() {
      before(function() {
        return coursesDB.add({title: 'First', author: null})
      })
      
      it('Найдено два курса', function(done) {
        agent
        .get('/courses/courses/?title=First')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);
          res.body.courses.length.should.equal(2);
          res.body.courses[0].title.should.equal('First');
          res.body.courses[1].title.should.equal('First');
          
          done();
        });
      });
    });
  });
  
  after(function() {
    return coursesDB.clear()
  })
})
