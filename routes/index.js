var express = require('express');
var router = express.Router();
var db = require('../lib/dbtestero');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', function(req, res, next) {
  console.log("Попытка входа!");
  var email = req.body.email
  var password = req.body.password
  var remember = (req.body.remember!=undefined)
  console.log("email: "+email)
  console.log("remember: "+remember)
  db.findUserByEmail(email, function(err, data){
    if(err || data==null)
    {
      res.json({ msg: "Пользователь не найден!" })
    }
    else if(data.password==password)
    {
      var msg = "Вы вошли!"
      if(remember) msg+=" Я постараюсь вас запомнить. (Хотя пока я этого не умею.)"
      res.json({ msg: msg })
    }
    else
    {
      res.json({ msg: "Неверный пароль!" })
    }
  }
  );
  
});

module.exports = router;
