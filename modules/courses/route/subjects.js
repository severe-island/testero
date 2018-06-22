"use strict"

const express = require('express')

const rolesDB = require('../db/roles')
const subjectsDB = require('../db/subjects')
const usersDB = require('../../users/db')
const sessions = require('../../users/lib/session')

module.exports = function (connection) {
    const router = express.Router()

    rolesDB.setup(connection)
    usersDB.setup(connection)
    sessions.setup(connection)

    router.get('/subjects/:id', function (req, res) {
        const subject_id = req.params.id
        return subjectsDB.findById(subject_id)
            .then((data) => {
                if (data) {
                    res.json({
                        status: true,
                        level: 'success',
                        msg: 'Темы найдена.',
                        subject: data
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

    router.get('/subjects', function (req, res) {
        return subjectsDB.findAll()
            .then((data) => {
                if (data) {
                    res.json({
                        status: true,
                        level: 'success',
                        msg: 'Темы получены.',
                        subjects: data
                    })
                } else {
                    res.json({
                        status: false,
                        level: 'warning',
                        msg: 'Темы не найдены.'
                    })
                }
            })
    })

    router.post('/subjects', function (req, res) {
        return sessions.checkSession(req)
            .then(checkResult => {
                if (!checkResult.status) {
                    res.json(checkResult);
                    return;
                }

                if (!req.body.title) {
                    res.json({
                        status: false,
                        level: "danger",
                        msg: "Не задано название темы."
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
                                        msg: "Для добавления темы Вы должны быть преподавателем."
                                    });
                                    return;
                                }

                                const subject = {
                                    title: req.body.title
                                };

                                return subjectsDB.add(subject)
                                    .then(subject => {
                                        res.json({
                                            status: true,
                                            level: "success",
                                            msg: "Тема добавлена.",
                                            subject: subject
                                        });
                                    });
                            });
                    });
            });
    });

    return router
}