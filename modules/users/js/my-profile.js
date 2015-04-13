$("#content #my-profile-menu #email").append(app.user.email);

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
