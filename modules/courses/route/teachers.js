var express = require('express');
var router = express.Router();

router.get('/teachers', function(req, res, next) {
    res.json({
        status: true,
        msg: "Список преподавателей загружен.",
        level: 'success',
        teachers: []
    });
});
