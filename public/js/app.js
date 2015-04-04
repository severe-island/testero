var latestBlock = null;
var latestMenuItem = null;
var users;
var db;

$(document).ready(function() {
  require("db", function(data){
    if(!data.status)
    {
      alert(data.msg);
    }
    db = data;
    $("#content").hide("slow");
    $("#content").html(db.html["admin-account"]);
    $("#content").show("slow");
  });
  
  require("users", function(data){
    if(!data.status)
    {
      alert(data.msg);
    }
    users = data;  
  });

  $.ajax({
    type: "POST",
    url: "/db",
    success: function(data)
    {
      alert(data.status)
      switch (data.status)
      {
        case 0:
        {
          $("#db-admin-account").show();
        }
      }
    }
  });
  
  $.ajax({
    type: "POST",
    url: "/login",
    success: function(data)
    {
      if(data.status)
      {
        $("#login-button").attr("disabled", "disabled");
        $("#signup-button").attr("disabled", "disabled");
        $("#logout-button").removeAttr("disabled");
      }
      else
      {
        $("#login-button").removeAttr("disabled");
        $("#signup-button").removeAttr("disabled");
        $("#logout-button").attr("disabled", "disabled");
      }
      //$("#main-menu").show();
    }
  });
  
  // Верхнее меню:
  
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
    eval(users.js.signup)
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
  
  $("#main-menu-button").click(function() {
    $("#main-menu").toggle();
  });
  
  $("#logout-button").click(function() {
    var url = "/logout";
    $.ajax({
      type: "POST",
      url: url,
      success: function(data){
        alert(data.msg);
        if (!data.status)
        {
          $("#logout-button").attr("disabled","disabled");
          $("#login-button").removeAttr("disabled");
          $("#signup-button").removeAttr("disabled");
        }
      }
    });
  });
}); 
