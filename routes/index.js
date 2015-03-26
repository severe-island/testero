var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', function(req, res, next) {
  console.log("Попытка входа!");
  var email = req.body.email
  if(email==="")
  {
    res.json({ msg: "Пустой емэйл!" })
   return
  }
  var password = req.body.password
  if(password==="")
  {
   res.json({ msg: "Пустой пароль!" })
   return
  }
  var remember = (req.body.remember!=undefined)
  console.log("email: "+email)
  console.log("password: "+password)
  console.log("remember: "+remember)
  var msg = "Все данные приняты и ты "
  if(!remember){
    msg=msg+"не "
  }
  msg=msg+"хочешь, чтобы я тебя запомнил"
  res.json({ msg: msg })
});

module.exports = router;
