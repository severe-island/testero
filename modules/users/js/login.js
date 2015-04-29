$("#login-form").submit(function() {
  $.ajax({
    type: "POST",
    url: "/users/login",
    data: $("#login-form").serialize(),
    success: function (data) {
      if (data.status) {
        bootstrapAlert(data.msg, "info", 1000, function() {
          app.isLoggedIn = true;
          $.ajax({
            type: "POST",
            url: "/users/getMe",
            success: function(data) {
              if (data.status) {
                app.user = data.user;
                tuneTopMenu();
                showMainMenu();
              }
            }
          });
        });
      }
      else {
        $("#content #alert")
          .html(data.msg);
        $("#content #alert")
          .addClass("alert-warning")
          .slideDown("slow", function() {
            $(this)
              .delay(1000)
              .slideUp("slow");
        });
      }
    },
    error: function(data) {
      $("#content #alert")
        .html("Сервер недоступен! Повторите позже.");
      $("#content #alert")
        .addClass("alert-danger")
        .slideDown("slow", function() {
          $(this).delay(1000)
            .slideUp("slow");
      });
    }
  });
  return false;
}); 

$("#login-form #email").blur(function() {
  if (!$(this).val())
  {
    $("#login-form #form-group-email").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#login-form #form-group-email").removeClass("has-error");
    $("#login-form #form-group-email").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#login-form #password").blur(function() {
  if (!$(this).val())
  {
    $("#login-form #form-group-password").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#login-form #form-group-password").removeClass("has-error");
    $("#login-form #form-group-password").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#login-form #email").focus(function() {
  $("#login-form #form-group-email").removeClass("has-error");
  $("#login-form #form-group-email").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#signup-form #password").focus(function() {
  $("#login-form #form-group-password").removeClass("has-error");
  $("#login-form #form-group-password").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});
