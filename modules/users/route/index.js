var express = require('express');
var router = express.Router();
var db = require('../db');
var conf = require('../../../config');

router.post('/login', function(req, res, next) {
  if (req.session.login) {
    var status, level;
    if (req.session.email === req.body.email) {
      status = true;
      level = "info";
    }
    else {
      status = false;
      level = "warning";
    }
    res.json({
      msg: "Вы уже зашли с почтой " + req.session.email + ".",
      status: status,
      level: level
    });
    return;
  }
  
  var email = req.body.email;
  var password = req.body.password;
  var remember = (req.body.remember !== undefined);
  db.findUserByEmail(email, function(err, data){
    if(err || data==null) {
      res.json({
        msg: "Пользователь не найден!",
        status: false, 
        level: "info"
      })
      return;
    }
    if(data.removed) {
      res.json({
        status: false,
        level: "info",
        msg: "Ваш пользователь удалён!"
      });
      return;
    }
    if(data.password != password) {
      res.json({
        msg: "Неверный пароль!",
        status: false,
        level: "info"
      });
      return;
    }
    var msg = "Вы вошли!"
    if(remember){
      msg+=" Я постараюсь вас запомнить."
      req.session.cookie.originalMaxAge = 1000*60*60;
    }
    else {
      req.session.cookie.originalMaxAge = null
      req.session.cookie.expires = false
    }
    req.session.login = true
    req.session.email = email
    res.json({
      msg: msg,
      status: true,
      level: "success"
    });
  });
});

router.get('/logout', function(req, res, next) {
  if (req.session.login) { 
    delete req.session.login;
    var email = req.session.email;
    delete req.session.email;
    res.json({
      msg: "Вы вышли и теперь больше не " + email + ".",
      status: true,
      level: "success"
    });
  }
  else {
    res.json({
      msg: "Так ведь вы и не входили!",
      status: true,
      level: "info"
    });
  }
});

// DEPRECATED:

router.post('/signup', function(req, res, next) {
  if(req.session.login)
  {
    res.json({
      msg: "Вы уже вошли как "+ req.session.email +"! Зачем вам регистрироваться?",
      status: false,
      level: "warning"
    });
    return;
  }
  if(!req.body.email || !req.body.password || !req.body.passwordDuplicate) {
    res.json({
      msg: "Указаны не все данные.",
      status: false,
      level: "danger"
    });
    return;
  }
  var email = req.body.email;
  var password = req.body.password;
  var passwordDuplicate = req.body.passwordDuplicate;
  db.findUserByEmail(email, function(err, data) {
    if(err)
    {
      res.json({
        msg: "Ошибка БД: " + err.message,
        status: false,
        level: "danger"
      });
      return;
    }
    if(data!=null)
    {
      res.json({
        msg: "Такой пользователь с этой почтой уже есть!",
        status: false,
        level: "danger"
      });
      return;
    }
    if (password != passwordDuplicate)
    {
      res.json({
        msg: "Пароли не совпадают!",
        status: false,
        level: "danger"
      });
      return;
    }
    if(email.indexOf('@')<0)
    {
      res.json({
        msg: "Некорректный email!",
        status: false,
        level: "danger"
      });
    }
    db.addNewUser(email, password, false, function(err, newUser) {
      if(err)
      {
        res.json({
          msg: "Ошибка БД: " + err.message,
          status: false,
          level: "danger"
        });
        return;
      }
      delete newUser.password;
      req.session.login = true;
      req.session.email = email;
      res.json({
        msg: "Пользователь успешно зарегистрирован!",
        status: true,
        level: "success",
        user: newUser
      });
    });
  });
}); 

// DEPRECATED:

router.post('/registerUser', function(req, res, next) {
  if (!req.session.login) {
    res.json({
      msg: "Вы должны быть авторизованным пользователем",
      status: false,
      level: "danger"
    });
    return;
  }
  
  db.findUserByEmail(req.session.email, function(err, data){
    if (err || data === null) {
      res.json({
        msg: "Вы не являетесь пользователем системы",
        status: false,
        level: "danger"
      });
      return;
    }
    
    var initiator = data;
    
    if (initiator.removed) {
      res.json({
        msg: "Ваш аккаунт " + email + " был удалён",
        status: false,
        level: "danger"
      });
      return;
    }

    if (!initiator.isAdministrator) {
      res.json({
        msg: "Только администратор может добавлять новых пользователей",
        status: false,
        level: "danger"
      });
      return;
    }
    
    var email = req.body.email;
    var password = req.body.password;
    var passwordDuplicate = req.body.passwordDuplicate;
    var isAdministrator = req.body.isAdministrator;
    var registeredBy = initiator.email;

    if(!email) {
      res.json({
        msg: "Не задан email нового пользователя",
        status: false,
        level: "danger"
      });
      return;
    }

    if (email.indexOf('@') < 0) {
      res.json({
        msg: "Некорректный email",
        status: false,
        level: "danger"
      });
      return;
    }

    if (!password) {
      res.json({
        msg: "Не задан пароль нового пользователя",
        status: false,
        level: "danger"
      });
      return;
    }

    if (!passwordDuplicate) {
      res.json({
        msg: "Не задан повтор пароля нового пользователя",
        status: false,
        level: "danger"
      });
      return;
    }

    if (password !== passwordDuplicate) {
      res.json({
        msg: "Пароли не совпадают",
        status: false,
        level: "danger"
      });
      return;
    }
    
    db.findUserByEmail(email, function(err, data) {
      if (err) {
        var msg;
        if (initiator.isAdministrator) {
          msg = "Ошибка БД: " + err.message;
        }
        else {
          msg = "Внутренняя ошибка сервера";
        }
        res.json({
          msg: msg,
          status: false,
          level: "danger"
        });
        return;
      }

      if (data !== null) {
        res.json({
          msg: "Пользователь " + email + " уже есть",
          status: false,
          level: "warning"
        });
        return;
      }

      var user = {
        email: email,
        password: password,
        isAdministrator: isAdministrator,
        registeredBy: registeredBy
      };
      db.registerUser(user, function(err, newUser) {
        if (err) {
          res.json({
            msg: "Ошибка БД: " + err.message,
            status: false,
            level: "danger"
          });
          return;
        }
        
        delete newUser.password;
        /*req.session.login = true;
        req.session.email = email;*/
        
        res.json({
          msg: "Пользователь " + email + " успешно зарегистрирован!",
          status: true,
          level: "success",
          user: newUser
        });
      });
    });
  });
});


router.post('/requestRemoving', function(req, res, next) {
  if(!req.session.login) {
    res.json({
      status: true,
      level: "info",
      msg: "Вы не вошли, поэтому не можете себя удалить."
    });
    return;
  }
  db.updateUser(req.session.email, { removingRequested: true }, req.session.email, function(err) {
    if(err) {
      res.json({
        status: true,
        level: "info",
        msg: "Ошибка БД: " + err.message
      });
      return;
    }
    delete req.session.login;
    delete req.session.email;
    res.json({
      status: true,
      level: "info",
      msg: "Запрос на удаление оставлен."
    });
  })
});

router.post('/removeUser', function(req, res, next) {
  if(!req.session.login) {
    res.json({
      status: false,
      level: "danger",
      msg: "Сначала войдите в систему!"
    })
    return
  }
  if(!req.body.email) {
    res.json({
      status: false,
      level: "danger",
      msg: "Укажите email!"
    });
    return;
  }
  var targetEmail = req.body.email
  db.findUserByEmail(req.session.email, function(err, user) {
    if(err) {
      res.json({
        msg: "Ошибка БД: " + err.message,
        status: false,
        level: "danger"
      });
      return;
    }
    if(!user) {
      res.json({
        status: false,
        level: "danger",
        msg: "Сначала войдите в систему!"
      })
      return 
    }
    if(!user.isAdministrator && user.email!==targetEmail) {
      res.json({
        msg: "Пользователя может удалить только администратор или сам пользователь",
        status: false,
        level: "danger"
      });
      return;
    }
    db.removeUser(targetEmail, function(err) { 
      if(err) {
        res.json({
          msg: "Ошибка БД: " + err.message,
          status: false,
          level: "danger"
        });
        return;
      }
      res.json({
        msg: "Пользователь был удалён!: ",
        status: true,
        level: "success"
      });
      return;
    })
  })
})

router.post('/clearUsers', function(req, res, next) {
  if(!req.session.login) {
    res.json({
      status: false,
      level: "danger",
      msg: "Сначала войдите в систему!"
    })
    return
  }
  db.findUserByEmail(req.session.email, function(err, user) {
    if(err) {
      res.json({
        msg: "Ошибка БД: " + err.message,
        status: false,
        level: "danger"
      });
      return;
    }
    if(!user) {
      res.json({
        status: false,
        level: "danger",
        msg: "Сначала войдите в систему!"
      })
      return 
    }
    if(!user.isAdministrator) {
      res.json({
        msg: "Очистить базу пользователей может только администратор!",
        status: false,
        level: "danger"
      });
      return;
    }
    db.clearUsers(function(err) { 
      if(err) {
        res.json({
          msg: "Ошибка БД: " + err.message,
          status: false,
          level: "danger"
        });
        return;
      }
      res.json({
        msg: "Все пользователи были удалены!",
        status: true,
        level: "success"
      });
    })
  })
})


router.get('/getMe', function(req, res, next) {
  if(!req.session.login) {
    res.json({
      status: false,
      level: "warning",
      msg: "Вы ещё не вошли в систему."
    });
    return;
  }
  
  db.findUserByEmailWithoutPassword(req.session.email, true, function(err, user) {
    if (err) {
      var msg = 'Ошибка базы данных' 
        + (conf.mode !== 'production' ? ': ' + err.message : '.');
      res.json({
        status: false,
        level: "danger",
        msg: msg
      });
      return;
    }
    
    if (!user) {
      res.json({
        status: false,
        level: "danger",
        msg: "Пользователь не найден. Возможно ошибка с сессией или базой данных. \n\
          Войдите в систему заново."
      });
      return;
    }
    
    res.json({
      status: true,
      level: "success",
      msg: "Пользователь найден.",
      user: user
    });
  });
});

router.post("/user/", function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var passwordDuplicate = req.body.passwordDuplicate;

  if(!email) {
    res.json({
      level: false,
      status: "danger",
      msg: "Не передан email."
    });
    return;
  }

  if(!password) {
    res.json({
      level: false,
      status: "danger",
      msg: "Не передан пароль (password)."
    });
    return;
  }

  if(!passwordDuplicate) {
    res.json({
      level: false,
      status: "danger",
      msg: "Не передано подтверждение пароля (passwordDuplicate)."
    });
    return;
  }

  if(password !== passwordDuplicate) {
    res.json({
      level: false,
      status: "danger",
      msg: "Пароль и подтверждение не совпадают."
    });
    return;
  }

  db.findUserByEmail(email, function(err, user) {
    if(err) {
      res.json({
        status: false,
        level: "danger",
        msg: "Ошибка базы данных: " + err.message
      });
      return;
    }

    if(user) {
      res.json({
        status: false,
        level: "danger",
        msg: "Пользователь " + email + " уже существует."
      });
      return;
    }

    db.isAdminExists(function(adminExists) {
      var user = { };
      user.email = email;
      user.password = password;
      user.registeredBy = null;
      user.isAdministrator = !adminExists;
      db.registerUser(user, function(err, newUser) {
        delete newUser.password;
        if(adminExists) {
          var msg = "Пользователь успешно зарегистрирован.";
        }
        else {
          var msg = "Первый пользователь был успешно зарегистрирован и стал администратором."
        }
        res.json({
          status: true,
          level: "success",
          msg: msg,
          user: newUser
        });
      });
    });
  });
});

module.exports = router;
