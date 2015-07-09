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
      url: "/users/signup",
      data: $("#users-form-signup").serialize(),
      success: function (data) {
        showAlert(data.msg, "info", 2000, function() {
          if (data.status) {
            app.isLoggedIn = true;
            app.user = data.user;
            $('*').trigger('users-login');
            if (!(window.history && history.pushState)) {
              loadPage('/main.json');
            }
            else {
              history.back();
            }
          }
        });
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
