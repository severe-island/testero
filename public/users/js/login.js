$("#form-login").submit(function() {
  $.ajax({
    type: "POST",
    url: "/users/login",
    data: $("#form-login").serialize(),
    success: function (data) {
      if (data.status) {
        localStorage.user_id = data.user._id;
        showAlert(data.msg, "info", 1000, function() {
          getMe(function(data) {
              if (data.status) {
                if (!(window.history && history.pushState)) {
                  loadPage('/main.json');
                }
                else {
                  history.back();
                }
                $('*').trigger('users-login');
              }
            });
          });
      }
      else {
        $("#page-content #alert")
          .html(data.msg)
          .addClass("alert-warning")
          .slideDown("slow", function() {
            $(this)
              .delay(1000)
              .slideUp("slow");
        });
      }
    },
    error: function(data) {
      $("#page-content #alert")
        .html("Сервер недоступен! Повторите позже.")
        .addClass("alert-danger")
        .slideDown("slow", function() {
          $(this).delay(1000)
            .slideUp("slow");
      });
    }
  });
  return false;
}); 

$("#form-login #email").blur(function() {
  if (!$(this).val())
  {
    $("#form-login #form-group-email").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#form-login #form-group-email").removeClass("has-error");
    $("#form-login #form-group-email").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#form-login #password").blur(function() {
  if (!$(this).val())
  {
    $("#form-login #form-group-password").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#form-login #form-group-password").removeClass("has-error");
    $("#form-login #form-group-password").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#form-login #email").focus(function() {
  $("#form-login #form-group-email").removeClass("has-error");
  $("#form-login #form-group-email").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#signup-form #password").focus(function() {
  $("#form-login #form-group-password").removeClass("has-error");
  $("#form-login #form-group-password").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});
