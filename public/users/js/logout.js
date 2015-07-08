$.ajax({
  type: "GET",
  url: "/users/logout",
  success: function (data) {
    showAlert(data.msg, "info", 2000, function () {
      if (data.status) {
        app.isLoggedIn = false;
        app.user = {};
        tuneTopMenu();
      }
      if (!(window.history && history.pushState)) {
        loadPage('/main.json');
      }
      else {
        if (false) {
          history.back();
        }
        else {
          history.pushState(null, null, '/#!main');
          loadPage('/main.json');
        }
      }
    });
  }
});
