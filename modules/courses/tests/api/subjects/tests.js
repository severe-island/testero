"use strict"

const config = require('config')
const cookieParser = require('cookie-parser')
const mongodb = require('mongodb')
const should = require('should')
const supertest = require('supertest')

const rolesDB = require('../../../db/roles')
const subjectsDB = require('../../../db/subjects')
const testsDB = require('../../../db/tests')
const usersDB = require('../../../../users/db')

describe('GET /courses/subjects/:id/tests', function () {
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

                rolesDB.setup(db)
                subjectsDB.setup(db)
                testsDB.setup(db)
                usersDB.setup(db)

                app = require('../../../../../app')(db)
                app.use(cookieParser())

                agent = supertest.agent(app)

                return testsDB.clear()
                    .then(() => {
                        return subjectsDB.clear()
                    })
                    .then(() => {
                        return rolesDB.clearRoles()
                    })
                    .then(() => {
                        return usersDB.clearUsers()
                    })
            })
    })

    let user1 = {
        email: 'user1@user1',
        password: 'user1'
    }
    let userId1

    const subject1 = {
        title: 'Subject1',
        author: user1.email
    }
    let subjectId1

    const test1 = {
        task: 'Task1',
        'answer-type': 'number',
        answer: 42
    }

    context('Зарегистрирован некая тема без тестов', function () {
        before(function () {
            return subjectsDB.add(subject1)
                .then(subject => {
                    subjectId1 = subject.id
                })
        })

        it('Получение пустого списка тестов темы', function () {
            return agent
                .get('/courses/subjects/' + subjectId1 + '/tests')
                .set('X-Requested-With', 'XMLHttpRequest')
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    res.body.tests.should.be.an.instanceOf(Array).and.have.lengthOf(0)
                })
        })
    })

    context('Добавление первой темы', function () {
        before('Вход в систему', function () {
            return usersDB.registerUser(user1)
                .then(user => {
                    userId1 = user.id

                    return rolesDB.assignRole(userId1, 'teacher')
                })
                .then(() => {
                    return agent
                        .post('/users/users/' + userId1 + '/auth')
                        .set('X-Requested-With', 'XMLHttpRequest')
                        .send({
                            password: user1.password
                        })
                        .expect('Content-Type', /application\/json/)
                        .expect(200)
                        .then(res => {
                            res.body.status.should.equal(true, res.body.msg);
                        })
                })
        })

        it('Добавляем к теме тест', function () {
            return agent
                .post('/courses/subjects/' + subjectId1 + '/tests')
                .set('X-Requested-With', 'XMLHttpRequest')
                .send(test1)
                .expect('Content-Type', /application\/json/)
                .expect(200)
                .then(res => {
                    res.body.status.should.equal(true, res.body.msg);
                    should(res.body.test).not.be.null()
                })
        })
    })

    after(function() {
        return testsDB.clear()
            .then(() => {
                return subjectsDB.clear()
            })
            .then(() => {
                return rolesDB.clearRoles()
            })
            .then(() => {
                return usersDB.clearUsers()
            })
    })
})
