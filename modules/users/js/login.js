$("#login-form").submit(function() {
  $.ajax({
    type: "POST",
    url: "/login",
    data: $("#login-form").serialize(),
         success: function(data)
         {
           alert(data.msg);
           if (data.status)
           {
             $("#logout-button").removeAttr("disabled");
             $("#login-button").attr("disabled", "disabled");
             $("#signup-button").attr("disabled", "disabled");
             $("#login").hide();
             $("#main-menu").show();
           }
         }
  });
  return false;
}); 
