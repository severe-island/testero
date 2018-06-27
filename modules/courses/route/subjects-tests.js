"use strict"

const express = require('express')

const rolesDB = require('../db/roles')
const usersDB = require('../../users/db')
const subjectsDB = require('../db/subjects')
const testsDB = require('../db/tests')
const sessions = require('../../users/lib/session')

module.exports = function (connection) {
    const router = express.Router()

    rolesDB.setup(connection)
    usersDB.setup(connection)
    testsDB.setup(connection)
    sessions.setup(connection)

    router.get('/subjects/:id/tests', function (req, res) {
        const subject_id = req.params.id
        return subjectsDB.findById(subject_id)
            .then((data) => {
                if (data) {
                    const tests = data.tests || []
                    res.json({
                        status: true,
                        level: 'success',
                        msg: 'Тесты темы получены.',
                        tests: tests
                    })
                } else {
                    res.json({
                        status: false,
                        level: 'warning',
                        msg: 'Тема не найдена.'
                    })
                }
            })
    })

    router.post('/subjects/:id/tests', function (req, res) {
        const subject_id = req.params.id
        return sessions.checkSession(req)
            .then(checkResult => {
                if (!checkResult.status) {
                    res.json(checkResult);
                    return;
                }

                if (!req.body.task) {
                    res.json({
                        status: false,
                        level: "danger",
                        msg: "Не задано задание теста."
                    });
                    return;
                }

                return usersDB.findUserByEmail(checkResult.user.email)
                    .then(user => {
                        if (!user) {
                            res.json({
                                status: false,
                                level: "danger",
                                msg: "Вы не найдены в базе данных."
                            });
                            return;
                        }

                        return rolesDB.getRolesByEmail(checkResult.user.email)
                            .then(roles => {
                                if (!roles || roles.indexOf("teacher")) {
                                    res.json({
                                        status: false,
                                        level: "danger",
                                        msg: "Для добавления теста Вы должны быть преподавателем."
                                    });
                                    return;
                                }

                                return subjectsDB.findById(subject_id)
                                    .then(subject => {
                                        if (!subject) {
                                            res.json({
                                                status: false,
                                                level: "danger",
                                                msg: "Тема не найдена."
                                            });
                                            return;
                                        }

                                        if (subject.authors.indexOf(req.session.email) < 0) {
                                            res.json({
                                                status: false,
                                                level: "danger",
                                                msg: "Добавлять тесты могут только авторы темы."
                                            });
                                            return;
                                        }

                                        const test = {
                                            task: req.body.task,
                                            'answer-type': req.body['answer-type'],
                                            answer: req.body.answer
                                        };
                                        return subjectsDB.addTest(subject_id, test)
                                            .then(test => {
                                                if (test) {
                                                    res.json({
                                                        status: true,
                                                        level: "success",
                                                        msg: "Тест добавлен.",
                                                        subject: subject
                                                    });
                                                } else {
                                                    res.json({
                                                        status: true,
                                                        level: "danger",
                                                        msg: "Тест не был добавлен.",
                                                        subject: subject
                                                    });
                                                }

                                            });
                                    });
                            });
                    });
            });
    });

    return router
}
