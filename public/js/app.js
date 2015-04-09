var app = {
  modules: {}
};
var modules = ["app", "users", "courses"];

function bootstrapAlert(msg, type, delay) {
  $("#content")
    .hide("slow")
    .html(app.modules.app.html["alert"]);
  $("#content .alert")
    .addClass("alert-" + type)
    .html(msg);
  $("#content")
    .show("slow")
    .delay(delay)
    .hide("slow");
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
              .show("slow");
          });
      }
      else {
        $("#content")
          .hide("slow", function() {
            $(this)
              .html(app.modules.app.html["main-menu"])
              .show("slow");
          });
      }
    }
  });
  
  $.ajax({
    type: "POST",
    url: "/users/login",
    success: function(data)
    {
      if(data.status) {
        $("#login-button").attr("disabled", "disabled");
        $("#signup-button").attr("disabled", "disabled");
        $("#logout-button").removeAttr("disabled");
        $("#courses-button").removeAttr("disabled");
      }
      else {
        $("#login-button").removeAttr("disabled");
        $("#signup-button").removeAttr("disabled");
        $("#logout-button").attr("disabled", "disabled");
        $("#courses-button").attr("disabled", "disabled");
      }
    }
  });
  
  // Верхнее меню:
  
   // TODO: разобраться с необходимостью отключения/включения кнопки меню
  $("#main-menu-button").removeAttr("disabled");
  
  $("#main-menu-button").click(function() {
    $("#content")
      .hide("slow", function() {
        $(this)
          .html(app.modules.app.html["main-menu"])
          .show("slow");
    });
  });
  
  $("#courses-button").click(function() {
    $("#content")
      .hide("slow", function() {
        $(this)
          .html(app.modules.courses.html["menu"])
          .show("slow");
    });
  });
  
  $("#signup-button").click(function() {
    $("#content")
      .hide("slow", function() {
        $(this)
          .html(app.modules.users.html["signup"])
          .show("slow");
      });
  });
  
  $("#login-button").click(function() {
    $("#content")
      .hide("slow", function() {
        $(this)
          .html(app.modules.users.html["login"])
          .show("slow");
      });
  });
  
  $("#logout-button").click(function() {
    var url = "/users/logout";
    $.ajax({
      type: "POST",
      url: url,
      success: function(data) {
        bootstrapAlert(data.msg, "info", 2000);
        if (!data.status) {
          $("#logout-button").attr("disabled","disabled");
          $("#login-button").removeAttr("disabled");
          $("#signup-button").removeAttr("disabled");
          $("#content")
            .html(app.modules.app.html["main-menu"])
            .show("slow");
        }
      }
    });
  });
}

$(document).ready(function() {
  loadModules(app, modules, onLoadAllModules);
});
