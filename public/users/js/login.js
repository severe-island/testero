$("#form-login").submit(function() {
  $.ajax({
    type: 'GET',
    url: '/users/users/?email=' + $('#email').val(),
    success: function(data) {
      var user = data.user;
      if (data.status) {
        $.ajax({
          type: "POST",
          url: "/users/users/" + user.id + "/auth",
          data: $("#form-login").serialize(),
          success: function (data) {
            if (data.status) {
              localStorage.user_id = user.id;
              app.user = user;
              app.isLoggedIn = true;
              showAlert(data.msg, data.level, 1000, function() {
                if (!(window.history && history.pushState)) {
                  loadPage('/main.json');
                }
                else {
                  history.back();
                }
                $('*').trigger('users-login');
              });
            }
            else {
              $("#page-content #alert")
                .html(data.msg)
                .addClass("alert-" + data.level)
                .slideDown("slow", function() {
                  $(this)
                    .delay(1000)
                    .slideUp("slow");
              });
            }
          },
          error: function() {
            $("#page-content #alert")
              .html("Сервер недоступен. Повторите позже.")
              .addClass("alert-danger")
              .slideDown("slow", function() {
                $(this).delay(1000)
                  .slideUp("slow");
            });
          }
        });
      }
      else {
        $("#page-content #alert")
          .html(data.msg)
          .addClass("alert-" + data.level)
          .slideDown("slow", function() {
            $(this)
              .delay(1000)
              .slideUp("slow");
        });
      }
    },
    error: function() {
      $("#page-content #alert")
        .html("Сервер временно недоступен. Повторите позже.")
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
