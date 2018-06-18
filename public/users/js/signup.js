$("#users-form-signup").submit(function() {
  if ($(this).find("#email").val().length == 0)
  {
    $(this).find("#form-group-email").addClass("has-error");
    return false;
  }
  else
  {
    $(this).find("#form-group-email").removeClass("has-error");
    $(this).find("#form-group-email").addClass("has-success");
  }
  
  if ($(this).find("#password").val().length == 0)
  {
    $(this).find("#form-group-password").addClass("has-error");
    return false;
  }
  else
  {
    $(this).find("#form-group-password").removeClass("has-error");
    $(this).find("#form-group-password").addClass("has-success");
  }
  
  if ($(this).find("#password-duplicate").val().length == 0
    || $(this).find("#password").val() != $(this).find("#password-duplicate").val())
  {
    alert("Пароли не совпали!");
    return false;
  }
  else
  {
    $.ajax({
      type: "POST",
      url: "/users/users",
      data: $("#users-form-signup").serialize(),
      success: function (data) {
        var user = data.user;
        user.password = $("#users-form-signup #password").val();
        showAlert(data.msg, data.level, 1000, function() {
          if (!!data.status) {
            $.ajax({
              type: 'POST',
              url: '/users/login',
              data: user,
              success: function(data) {
                showAlert(data.msg, data.level, 1000, function() {
                  if (!!data.status) {
                    app.isLoggedIn = true;
                    delete user.password;
                    app.user = user;
                    localStorage.user_id = user.id;
                    $('*').trigger('users-login');
                    if (window.history && history.pushState) {
                      history.pushState(null, null, '/#!main');
                    }
                    loadPage('/main.json');
                  }
                });
              }
            });
          }
        });
      },
      error: function() {
        showAlert("Сервер недоступен. Попробуйте позже.", "danger");
      }
    });
  }
  return false;
}); 

$("#users-form-signup #email").blur(function() {
  if (!$(this).val())
  {
    $("#users-form-signup #form-group-email").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#users-form-signup #form-group-email").removeClass("has-error");
    $("#users-form-signup #form-group-email").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#users-form-signup #password").blur(function() {
  if (!$(this).val())
  {
    $("#users-form-signup #form-group-password").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#users-form-signup #form-group-password").removeClass("has-error");
    $("#users-form-signup #form-group-password").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#users-form-signup #password-duplicate").blur(function() {
  if (!$(this).val())
  {
    $("#users-form-signup #form-group-password-duplicate").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#users-form-signup #form-group-password-duplicate").removeClass("has-error");
    $("#users-form-signup #form-group-password-duplicate").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#users-form-signup #email").focus(function() {
  $("#users-form-signup #form-group-email").removeClass("has-error");
  $("#users-form-signup #form-group-email").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#users-form-signup #password").focus(function() {
  $("#users-form-signup #form-group-password").removeClass("has-error");
  $("#users-form-signup #form-group-password").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#users-form-signup #password-duplicate").focus(function() {
  $("#users-form-signup #form-group-password-duplicate").removeClass("has-error");
  $("#users-form-signup #form-group-password-duplicate").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#agreement-dialog #accept-button").click(function() {
  $("#users-form-signup #email").removeAttr("disabled");
  $("#users-form-signup #password").removeAttr("disabled");
  $("#users-form-signup #password-duplicate").removeAttr("disabled");
  $("#users-form-signup #signup-submit").removeAttr("disabled");
  $("#agreement-dialog").modal("hide");
});
