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

function bootstrapAlert(msg, type, delay, callback) {
  $("#content")
    .hide("slow", function() {
      $(this).html(app.modules.app.html["alert"]);
      $("#content .alert")
        .addClass("alert-" + type)
        .html(msg);
      $("#content")
        .slideDown("slow", function () {
          $(this).delay(delay)
            .hide("slow");
          callback();
        });
    });
}

function loadModules(app, modules, callback) {
  if (!modules.length) {
    callback();
    return;
  }
  var moduleName = modules[0];
  modules.shift();
  require(moduleName, function (data) {
    if (!data.status) {
      alert(data.msg);
      return;
    }
    app.modules[data.moduleName] = data;
    loadModules(app, modules, callback);
  });
}

function onLoadAllModules() {
  $.ajax({
    type: "POST",
    url: "/users/isAdminExists",
    success: function(data)
    {      
      if (!data.status) {
        $("#content")
          .hide("slow", function() {
            $(this)
              .html(app.modules.users.html["admin-account"])
              .slideDown("slow");
          });
      }
    }
  });
  
  $.ajax({
    type: "POST",
    url: "/users/getMe",
    success: function(data)
    {
      bootstrapAlert(data.msg, data.level, 2000, function() {
        if(data.status) {
          //$("#login-button").attr("disabled", "disabled");
          //$("#signup-button").attr("disabled", "disabled");
          $("#top-menu #login-button").hide();
          $("#top-menu #signin-button").hide();
          $("#top-menu #my-profile-item").show();
          $("#logout-button").removeAttr("disabled");
          $("#courses-button").removeAttr("disabled");
          app.isLoggedIn = true;
          app.user = data.user;
        }
        else {
          //$("#login-button").removeAttr("disabled");
          //$("#signup-button").removeAttr("disabled");
          $("#top-menu #login-button").show();
          $("#top-menu #signin-button").show();
          $("#top-menu #my-profile-item").hide();
          $("#logout-button").attr("disabled", "disabled");
          $("#courses-button").attr("disabled", "disabled");
          app.isLoggedIn = false;
        }
        showMainMenu();
      });
    }
  });
  
  // Верхнее меню:
  
   // TODO: разобраться с необходимостью отключения/включения кнопки меню
  $("#main-menu-button").removeAttr("disabled");
  
  $("#main-menu-button").click(function() {
    showMainMenu();
  });
  
  $("#courses-button").click(function() {
    $("#content")
      .hide("slow", function() {
        $(this)
          .html(app.modules.courses.html["menu"])
          .slideDown("slow");
    });
  });
  
  $("#signup-button").click(function() {
    $("#content")
      .hide("slow", function() {
        $(this)
          .html(app.modules.users.html["signup"])
          .slideDown("slow");
      });
  });
  
  $("#login-button").click(function() {
    $("#content")
      .hide("slow", function() {
        $(this)
          .html(app.modules.users.html["login"])
          .slideDown("slow");
      });
  });
  
  $("#logout-button").click(function() {
    var url = "/users/logout";
    $.ajax({
      type: "POST",
      url: url,
      success: function(data) {
        bootstrapAlert(data.msg, "info", 2000, function() {
          if (data.status) {
            $("#logout-button").attr("disabled", "disabled");
            $("#login-button").removeAttr("disabled");
            $("#signup-button").removeAttr("disabled");
            app.isLoggedIn = false;
            showMainMenu();
          }
        });
      }
    });
  });
  
  $("#top-menu #my-profile-item").click(function() {
    $("#content").hide("slow", function() {
      $(this)
        .html(app.modules.users.html["my-profile"])
        .slideDown("slow");
    });
    return false;
  });
}

$(document).ready(function() {
  loadModules(app, modules, onLoadAllModules);
});
