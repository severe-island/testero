var latestBlock = null;
var latestMenuItem = null;
var db;
var courses;
var users;
var app;

$(document).ready(function() {
  var modules_counter = 0;
  
  require("db", function(data){
    db = data;
    modules_counter++;
  });
  
  require("users", function(data){
    if(!data.status)
    {
      alert(data.msg);
    }
    users = data;
    modules_counter++;
  });
  
  require("courses", function(data){
    if (!data.status)
    {
      alert(data.msg);
    }
    courses = data;
    modules_counter++;
  });
  
  require("app", function(data){
    if(!data.status)
    {
      alert(data.msg);
    }
    app = data;
    modules_counter++;
  });
  
  /*if (!users) {
    alert("Модуль app не был загружен! Работа приложения приостановлена.");
    return;
  }*/
  
  /*while (modules_counter != 4) {
  }*/
  
  $("#content").html(app.html["main-menu"]).show("slow");

  $.ajax({
    type: "POST",
    url: "/db",
    success: function(data)
    {
      switch (data.status)
      {
        case 0:
        {
          $("#content").hide("slow");
          $("#content").html(db.html["admin-account"]);
          $("#content").show("slow");
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
  
  $("#main-menu-button").click(function() {
    $("#content").hide("slow");
    $("#content").html($("#main-menu").clone().show());
    $("#content").show("slow");
  });
  
  $("#courses-button").click(function() {
    $("#content").hide("slow");
    $("#content").html(courses.html.menu);
    $("#content").show("slow");
  });
  
  $("#signup-button").click(function() {
    $("#content").hide("slow");
    $("#content").html(users.html.signup);
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
    $("#content").html(users.html.login);
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
