var express = require('express');
var router = express.Router();
/*var db = require('../../../lib/nedbtestero');

router.post('/', function(req, res, next) { 
  console.log('сессия:')
  console.log(req.session);
  db.isAdminExists(function(adminExists){
    if(!adminExists) {
      res.json({
        msg: "Первый запуск!",
        status: 0
      })
    }
    else
    {
      res.json({
        msg: "Не первый запуск",
        status: 1
      })
    }
  })
})*/

module.exports = router;
