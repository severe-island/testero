var app = {
  modules: {}
};
var modules = ["app", "db", "users", "courses"];

function bootstrapAlert(msg, type, delay) {
  $("#content")
    .hide("slow")
    .html(app.modules.app.html["alert"])
    .show("slow");
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
    url: "/db",
    success: function(data)
    {
      
      if (!data.status) {
        $("#content")
          .hide("slow")
          .html(app.modules.db.html["admin-account"])
          .show("slow");
      }
      else {
        $("#content")
          .hide("slow")
          .html(app.modules.app.html["main-menu"])
          .show("slow");
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
        alert(data.msg);
        if (!data.status) {
          $("#logout-button").attr("disabled","disabled");
          $("#login-button").removeAttr("disabled");
          $("#signup-button").removeAttr("disabled");
        }
      }
    });
  });
}

$(document).ready(function() {
  loadModules(app, modules, onLoadAllModules);
});
