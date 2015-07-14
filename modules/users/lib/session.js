var db = require('../db');
var conf = require('../../../config');

module.exports.checkSession = function (req, callback) {
  if (!req.session.login || !req.session.email) {
    var checkResult = {
      status: false,
      level: 'info',
      msg: 'Вы не авторизованы.'
    };
    callback(checkResult);
    return;
  }

  db.findUserByEmail(req.session.email, function(err, data) {
    var checkResult;
    if (err) {
      checkResult = {
        status: false,
        level: "danger",
        msg: "Ошибка базы данных: " 
          + (conf.mode !== 'production' ? ': ' + err.message : '.')
      };
      callback(checkResult);
      return;
    }
    
    if (!data) {
      req.session.login = false;
      checkResult = {
        status: false,
        level: "danger",
        msg: "Ваша сессия не найдена. Возможно ошибка с сессией или базой данных. \n\
        Войдите в систему заново."
      };
      callback(checkResult);
      return;
    }
    
    if (data.removed) {
      req.session.login = false;
      res = {
        msg: "Ваш аккаунт " + data.email + " был удалён. Сессия будет разорвана.",
        status: false,
        level: "danger"
      };
      callback(checkResult);
      return;
    }
    
    checkResult = {
      status: true,
      level: "success",
      msg: 'Вы авторизованы.',
      user: data
    };
    callback(checkResult);
  });
};
