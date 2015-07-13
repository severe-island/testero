var express = require('express');
var router = express.Router();

module.exports.checkSession = function (req, res, callback) {
  if (!req.session.login || !req.session.email) {
    res = {
      status: false,
      level: 'info',
      msg: 'Вы не авторизованы.'
    };
    callback(false, null);
    return;
  }
  
  var authorized = false;
  var user = null;
  db.findUserByEmail(req.session.email, function(err, data) {
    if(err) {
      res = {
        status: false,
        level: "danger",
        msg: "Ошибка базы данных: " 
          + (conf.mode !== 'production' ? ': ' + err.message : '.')
      };
      return;
    }
    
    if(!data) {
      res = {
        status: false,
        level: "danger",
        msg: "Ваша сессия не найдена. Возможно ошибка с сессией или базой данных. \n\
        Войдите в систему заново."
      };
      return;
    }
    
    if(data.removed) {
      req.session.login = false;
      res = {
        msg: "Ваш аккаунт " + data.email + " был удалён. Сессия будет разорвана.",
        status: false,
        level: "danger"
      };
      return;
    }
    
    res = {
      status: true,
      level: "success",
      msg: 'Вы авторизованы.'
    };
    authorized = true;
    user = data;
  });
  callback(authorized, user);
};

module.exports = router;
