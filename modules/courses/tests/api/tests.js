"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const should = require('should')
const supertest = require('supertest')

const testsDB = require('../../db/tests')

describe('GET /courses/tests', function () {
    let app
    let agent

    before(function () {
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

          testsDB.setup(settings)

          app = require('../../../../app')(settings)
          app.use(cookieParser())

          agent = supertest.agent(app)

          return testsDB.clear()
        })
    })

    const test1 = {
        task: 'Task1',
        'answer-type': 'number',
        answer: 42
    }
    let testId1

    context('Нет ни одного теста', function () {
        it('Получение пустого списка тестов', function () {
            return agent
                .get('/courses/tests')
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    should(res.body.tests).be.not.null()
                    should(res.body.tests).be.not.undefined()
                    res.body.tests.should.be.an.instanceOf(Array).and.have.lengthOf(0)
                })
        })
    })

    context('Есть один тест', function () {
        before('Добавление теста', function () {
            return testsDB.add(test1)
                .then(data => {
                    testId1 = data.id
                })
        })

        it('Получаем список из одного теста', function () {
            return agent
                .get('/courses/tests')
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    should(res.body.tests).not.be.null()
                    should(res.body.tests).be.an.instanceOf(Array).and.have.lengthOf(1)
                })
        })

        it('Получаем тест по его id', function() {
            return agent
                .get('/courses/tests/' + testId1)
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    should(res.body.test).not.be.null()
                    should(res.body.test).not.be.undefined()
                    should(res.body.test).have.property('id')
                })
        })
    })

    after(function() {
        return testsDB.clear()
    })
})
