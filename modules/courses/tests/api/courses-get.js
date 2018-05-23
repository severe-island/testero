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

    return mongodb.MongoClient.connect(mongoUrl, {useNewUrlParser: true})
      .then(client => {
        const db = client.db(dbName)

        coursesDB.setup(db)

        app = require('../../../../app')(db)
        app.use(cookieParser())
        
        agent = supertest.agent(app)
      })
      .then(() => {
        return coursesDB.clearCourses()
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
      before(function(done) {
        coursesDB.add({title: 'Первый курс', author: null}, function() {
          done();
        });
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
      before(function(done) {
        coursesDB.add({title: 'Второй курс', author: null}, function() {
          done();
        });
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
        return coursesDB.clearCourses()
      })
    })
  })
  
  describe('Получение курса по ID', function() {
    context('Список курсов пуст', function() {
      it('Попытка получить курс по некоторому ID', function(done) {
        agent
        .get('/courses/courses/5963ce98fb28ee7d3fb4f6a0')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(false, res.body.msg);
          
          done();
        });
      });
    });
    
    context('Есть два курса', function() {
      var ID1, ID2;
      before(function(done) {
        coursesDB.add({title: 'Первый курс', author: null}, function(err, course) {
          ID1 = course._id;
          coursesDB.add({title: 'Второй курс', author: null}, function(err, course) {
            ID2 = course._id;
            done();
          });
        })
      })
    
      it('Попытка получить курс по недействительному ID', function(done) {
        agent
        .get('/courses/courses/5963ce98fb28ee7d3fb4f6a0')
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(false, res.body.msg);
          
          done();
        });
      });
      
      it('Получение первого курса по его ID', function(done) {
        agent
        .get('/courses/courses/' + ID1)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }

          res.body.status.should.equal(true, res.body.msg);
          res.body.course.should.not.equal(undefined);
          res.body.course._id.should.equal(ID1.toString());
          res.body.course.should.have.property('title');
          
          done();
        });
      });
      
      it('Получение второго курса по его ID', function(done) {
        agent
        .get('/courses/courses/' + ID2)
        .set('X-Requested-With', 'XMLHttpRequest')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            throw err;
          }
          
          res.body.status.should.equal(true, res.body.msg);
          res.body.course.should.not.equal(undefined);
          res.body.course._id.should.equal(ID2.toString());
          res.body.course.should.have.property('title');
          
          done();
        });
      });
    });
  });
  
  describe('Поиск курсов по названию (GET /courses/courses/?title=title', function() {
    context('Нет ни одного курса', function() {
      before(function() {
        return coursesDB.clearCourses();
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
      before(function(done) {
        coursesDB.add({title: 'First', author: null}, function() {
          done();
        });
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
      before(function(done) {
        coursesDB.add({title: 'Second', author: null}, function() {
          done();
        });
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
      before(function(done) {
        coursesDB.add({title: 'First', author: null}, function() {
          done();
        });
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
    return coursesDB.clearCourses()
  })
})
