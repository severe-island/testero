"use strict"

const express = require('express')

const coursesDB = require('../db/courses')
const rolesDB = require('../db/roles')
const usersDB = require('../../users/db')
const sessions = require('../../users/lib/session')

module.exports = function (connection) {
    const router = express.Router()

    coursesDB.setup(connection)
    rolesDB.setup(connection)
    usersDB.setup(connection)
    sessions.setup(connection)

    router.get('/courses/:id/authors', function (req, res) {
        const course_id = req.params.id

        return coursesDB.findById(course_id)
            .then((data) => {
                if (data) {
                    const subjects = data.subjects || []
                    res.json({
                        status: true,
                        level: 'success',
                        msg: 'Авторы курса получены.',
                        subjects: subjects
                    })
                } else {
                    res.json({
                        status: false,
                        level: 'warning',
                        msg: 'Курс не найден.'
                    })
                }
            })
    })

    router.post('/courses/:id/authors', function (req, res) {
        const course_id = req.params.id
        const email = req.body.email

        return sessions.checkSession(req)
            .then(checkResult => {
                if (!checkResult.status) {
                    res.json(checkResult);
                    return;
                }

                if (!email) {
                    res.json({
                        status: false,
                        level: "danger",
                        msg: "Не задан email автора."
                    });
                    return;
                }

                return usersDB.findUserByEmail(email)
                    .then(author => {
                        if (!author) {
                            res.json({
                                status: false,
                                level: "danger",
                                msg: "Пользователь не найден."
                            });
                            return;
                        }
                        return coursesDB.findById(course_id)
                            .then(course => {
                                if (!course) {
                                    res.json({
                                        status: false,
                                        level: "danger",
                                        msg: "Курс не найден."
                                    });
                                    return;
                                }

                                course.authors = course.authors || []

                                if (course.authors.indexOf(checkResult.user.email) < 0) {
                                    res.json({
                                        status: false,
                                        level: "danger",
                                        msg: "Добавлять авторов могут только авторы курса."
                                    });
                                    return;
                                }

                                return coursesDB.addAuthor(course_id, email)
                                    .then(() => {
                                        res.json({
                                            status: true,
                                            level: "success",
                                            msg: "Автор добавлен."
                                        });
                                    })
                                    .catch(err => {
                                        res.json({
                                            status: false,
                                            level: "danger",
                                            msg: err.message
                                        });
                                    })
                            });
                    })
            });
    });

    return router
}