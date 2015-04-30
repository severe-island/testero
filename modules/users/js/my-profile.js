$("#content #my-profile-menu #email").append(app.user.email);

$("#my-profile-menu #users-menu").click(function () {
  $("#content")
    .hide("slow", function () {
      $(this)
        .html(app.modules.users.html["menu"])
        .slideDown("slow");
    });

  return false;
});

$("#content #my-profile-menu #user-logout-item").click(function() {
  var url = "/users/logout";
    $.ajax({
    type: "POST",
    url: url,
    success: function (data) {
      bootstrapAlert(data.msg, "info", 2000, function () {
        if (data.status) {
          app.isLoggedIn = false;
          app.user = {};
          tuneTopMenu();
          showMainMenu();
        }
      });
    }
  });
  return false;
});


$("#user-password-edit-dialog #save-button").click(function() {
  $("#user-edit-password-form #email").val(app.user.email);
  $.ajax({
    type: "POST",
    url: "/users/updateProfile",
    data: $("#user-edit-password-form").serialize(),
    success: function (data) {
      $("#user-password-edit-dialog #alert")
        .addClass("alert-" + data.level)
        .html(data.msg)
        .slideDown("slow", function() {
          $(this)
            .delay(1000)
            .slideUp("slow");
        });
    },
    error: function (data) {
      $("#user-password-edit-dialog #alert")
        .addClass("alert-danger")
        .html("Сервер недоступен. Попробуйте позже.")
        .slideDown("slow", function() {
          $(this)
            .delay(1000)
            .slideUp("slow");
        });
    }
  });
  return false;
});
