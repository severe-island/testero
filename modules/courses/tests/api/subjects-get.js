"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const supertest = require('supertest')

const subjectsDB = require('../../db/subjects')

describe('GET /courses/subjects', function () {
    let app
    let agent

    before(function () {
        const mongoHost = config.db.host || 'localhost'
        const mongoPort = config.db.port || '27017'
        const dbName = config.db.name || 'testero-testing'
        const mongoUrl = 'mongodb://' + mongoHost + ':' + mongoPort + '/' + dbName

        return mongodb.MongoClient.connect(mongoUrl, {
                useNewUrlParser: true
            })
            .then(client => {
                const db = client.db(dbName)

                subjectsDB.setup(db)

                app = require('../../../../app')(db)
                app.use(cookieParser())

                agent = supertest.agent(app)

                return subjectsDB.clear()
            })
    })

    const subject1 = {
        title: 'Subject1'
    }
    let subjectId1

    const subject2 = {
        title: 'Subject2'
    }
    let subjectId2

    context('Список тем пуст', function () {
        it('Получен пустой список', function () {
            return agent
                .get('/courses/subjects/')
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    res.body.subjects.should.be.an.instanceOf(Array).and.have.lengthOf(0)
                })
        })
    })

    context('Добавлена одна тема', function () {
        before(function () {
            return subjectsDB.add(subject1)
                .then(data => {
                    subjectId1 = data.id
                });
        })

        it('Список тем состоит из одного элемента', function () {
            return agent
                .get('/courses/subjects/')
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    res.body.subjects.should.be.an.instanceOf(Array).and.have.lengthOf(1)
                })
        })

        it('Получена тема 1', function () {
            return agent
                .get('/courses/subjects/' + subjectId1)
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    res.body.subject.should.be.have.property('id')
                })
        })
    })

    context('Добавлена вторая тема', function () {
        before(function () {
            return subjectsDB.add(subject2)
                .then(data => {
                    subjectId2 = data.id
                });
        })

        it('Список тем состоит из двух элементов', function () {
            return agent
                .get('/courses/subjects/')
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    res.body.subjects.should.be.an.instanceOf(Array).and.have.lengthOf(2)
                })
        })

        it('Получена тема 2', function () {
            return agent
                .get('/courses/subjects/' + subjectId2)
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    res.body.subject.should.be.have.property('id')
                })
        })
    })

    after('Clear data base', function () {
        return subjectsDB.clear()
    })
})
