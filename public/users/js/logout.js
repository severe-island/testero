$.ajax({
  type: "GET",
  url: "/users/logout",
  success: function (data) {
    showAlert(data.msg, "info", 2000, function () {
      if (data.status) {
        app.user = {};
        app.isLoggedIn = false;
        delete localStorage.user_id;
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
      if (data.status) {
        $('*').trigger('users-logout');
      }
    });
  }
});
