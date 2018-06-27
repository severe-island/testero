"use strict"

const express = require('express')

const testsDB = require('../db/tests')
const sessions = require('../../users/lib/session')

module.exports = function (connection) {
    const router = express.Router()

    testsDB.setup(connection)
    sessions.setup(connection)

    router.get('/tests/:id', function (req, res) {
        const test_id = req.params.id
        return testsDB.findById(test_id)
            .then((data) => {
                if (data) {
                    res.json({
                        status: true,
                        level: 'success',
                        msg: 'Тест найден.',
                        test: data
                    })
                } else {
                    res.json({
                        status: false,
                        level: 'info',
                        msg: 'Тест не найден.'
                    })
                }
            })
    })

    router.get('/tests', function (req, res) {
        return testsDB.findAll()
            .then((data) => {
                if (data) {
                    res.json({
                        status: true,
                        level: 'success',
                        msg: 'Тесты получены.',
                        tests: data
                    })
                } else {
                    res.json({
                        status: false,
                        level: 'info',
                        msg: 'Тесты не найдены.'
                    })
                }
            })
    })

    return router
}
