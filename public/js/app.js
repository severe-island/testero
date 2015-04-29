var app = {
  modules: {},
  isLoggedIn: false,
  user: {}
};
var modules = ["app", "users", "courses"];

function showMainMenu() {
  $("#content")
    .hide("slow", function () {
      $(this)
        .html(app.modules.app.html["main-menu"])
        .slideDown("slow");
      if (app.isLoggedIn) {
        $("#content #main-menu #my-profile-item").removeClass("disabled");
      }
      else {
        $("#content #main-menu #my-profile-item").addClass("disabled");
      }
    });
}

function tuneTopMenu() {
  if (app.isLoggedIn) {
    $("#top-menu #login-item").hide();
    $("#top-menu #signup-item").hide();
    $("#top-menu #my-profile-item").show();
    $("#top-menu #logout-item").show();
    $("#top-menu #courses-item").show();
  }
  else {
    $("#top-menu #login-item").show();
    $("#top-menu #signup-item").show();
    $("#top-menu #my-profile-item").hide();
    $("#top-menu #logout-item").hide();
    $("#top-menu #courses-item").hide();
  }
}

function bootstrapAlert(msg, type, delay, callback) {
  $("#content")
    .hide("slow", function () {
      $(this).html(app.modules.app.html["alert"]);
      $("#content .alert")
        .addClass("alert-" + type)
        .html(msg);
      $("#content")
        .slideDown("slow", function () {
          $(this).delay(delay)
            .hide("slow");
          if (callback !== undefined) {
            callback();
          }
        });
    });
}

function onLoadAllModules() {
  $.ajax({
    type: "POST",
    url: "/users/isAdminExists",
    success: function (data) {
      if (!data.status) {
        $("#content")
          .hide("slow", function () {
            $(this)
              .html(app.modules.users.html["admin-account"])
              .slideDown("slow");
          });
      }
      else {
        if (app.mode !== "production") {
          bootstrapAlert(data.msg, data.level, 1000);
        }
        $.ajax({
          type: "POST",
          url: "/users/getMe",
          success: function (data) {
            if (data.status) {
              app.user = data.user;
              app.isLoggedIn = true;
            }
            bootstrapAlert(data.msg, data.level, 1000, function () {
              tuneTopMenu();
              showMainMenu();
            });
          }
        });
      }
    }
  });

  // Верхнее меню:

  $("#top-menu #main-menu-item").click(function () {
    showMainMenu();
    return false;
  });

  $("#top-menu #courses-item").click(function () {
    $("#content")
      .hide("slow", function () {
        $(this)
          .html(app.modules.courses.html["menu"])
          .slideDown("slow");
      });
    return false;
  });

  $("#top-menu #signup-item").click(function () {
    $("#content")
      .hide("slow", function () {
        $(this)
          .html(app.modules.users.html["signup"])
          .slideDown("slow");
      });
    return false;
  });

  $("#top-menu #login-item").click(function () {
    $("#content")
      .hide("slow", function () {
        $(this)
          .html(app.modules.users.html["login"])
          .slideDown("slow");
      });
    return false;
  });

  $("#top-menu #logout-item").click(function () {
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

  $("#top-menu #my-profile-item").click(function () {
    $("#content").hide("slow", function () {
      $(this)
        .html(app.modules.users.html["my-profile"])
        .slideDown("slow");
    });
    return false;
  });
}

$(document).ready(function () {
  $.ajax({
    type: "POST",
    url: "/app",
    success: function (data)
    {
      app = data;
      onLoadAllModules();
    }
  });
});
