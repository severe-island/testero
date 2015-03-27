var express = require('express');
var router = express.Router();
var db = require('../lib/dbtestero');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', function(req, res, next) {
  console.log(req.session)
  if(req.session.login)
  {
    res.json({ msg: "Вы уже зашли с почтой "+req.session.email+"!" })
    return;
  }
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
      if(remember){
        req.session.login = true
        req.session.email = email
        msg+=" Я постараюсь вас запомнить. Честно."
      }
      res.json({ msg: msg })
    }
    else
    {
      res.json({ msg: "Неверный пароль!" })
    }
  }
  );
  
});

router.post('/logout', function(req, res, next) {
  if(req.session.login)
  { 
    delete req.session.login
    var email = req.session.email
    delete req.session.email
    res.json({ msg: "Вы вышли и теперь вы больше не "+email+"!" })
  }
  else
  {
    res.json({ msg: "Так ведь вы и не входили!" })
  }
});

module.exports = router;
