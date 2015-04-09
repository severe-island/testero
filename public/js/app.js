var latestBlock = null;
var latestMenuItem = null;

var app = {
  modules: {}
};
var modules = ["db", "users", "courses", "app"];

$(document).ready(function() {
  for (var i = 0; i < modules.length; i++) {
    app.modules[modules[i]] = {};
    require(modules[i], function (data) {
      if (!data.status) {
        alert(data.msg);
        return;
      }
      app.modules[data.moduleName] = data;
      alert(app.modules[data.moduleName].msg);
      if(data.moduleName=="app") {
        $.ajax({
          type: "POST",
          url: "/db",
          success: function(data)
          {
            if(data.status==1)
            {
              $("#content").html(app.modules.app.html["main-menu"]).show("slow");
            }
          }
        }); 
      }
    });
  }

  
  $.ajax({
    type: "POST",
    url: "/db",
    success: function(data)
    {
      alert(data.msg);
      alert("status="+data.status);
      switch (data.status)
      {
        case 0:
        {
          $("#content").hide("slow");
          $("#content").html(app.modules.db.html["admin-account"]);
          $("#content").show("slow");
          break;
        }
      }
    }
  });
  
  $.ajax({
    type: "POST",
    url: "/users/login",
    success: function(data)
    {
      if(data.status)
      {
        $("#login-button").attr("disabled", "disabled");
        $("#signup-button").attr("disabled", "disabled");
        $("#logout-button").removeAttr("disabled");
        $("#courses-button").removeAttr("disabled");
      }
      else
      {
        $("#login-button").removeAttr("disabled");
        $("#signup-button").removeAttr("disabled");
        $("#logout-button").attr("disabled", "disabled");
        $("#courses-button").attr("disabled", "disabled");
      }
    }
  });
  
  // Верхнее меню:
  
  $("#main-menu-button").removeAttr("disabled");
  $("#main-menu-button").click(function() {
    $("#content").hide("slow");
    $("#content").html(app.modules.app.html["main-menu"]).show("slow");
    if(latestMenuItem)
    {
      latestMenuItem.removeAttr("disabled");
    }
    latestMenuItem = $("#main-menu-button");
    $("#main-menu-button").attr("disabled", "disabled");
  });
  
  $("#courses-button").click(function() {
    $("#content").hide("slow");
    $("#content").html(app.modules.courses.html.menu);
    $("#content").show("slow");
    if(latestMenuItem)
    {
      latestMenuItem.removeAttr("disabled");
    }
    latestMenuItem = $("#сourses-button");
    $("#сourses-button").attr("disabled", "disabled");
  });
  
  $("#signup-button").click(function() {
    $("#content").hide("slow");
    $("#content").html(app.modules.users.html.signup);
    $("#content").show("slow");
    if(latestMenuItem)
    {
      latestMenuItem.removeAttr("disabled");
    }
    latestMenuItem = $("#signup-button");
    $("#signup-button").attr("disabled", "disabled");
  });
  
  $("#login-button").click(function() {
    $("#content").hide("slow");
    $("#content").html(app.modules.users.html.login);
    $("#content").show("slow");
    if(latestMenuItem)
    {
      latestMenuItem.removeAttr("disabled");
    }
    latestMenuItem = $("#login-button");
    $("#login-button").attr("disabled", "disabled");
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
});
