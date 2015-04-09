$("#login-form").submit(function() {
  $.ajax({
    type: "POST",
    url: "/users/login",
    data: $("#login-form").serialize(),
         success: function(data)
         {
           alert(data.msg);
           if (data.status)
           {
             $("#login-button").attr("disabled", "disabled");
             $("#signup-button").attr("disabled", "disabled");
             $("#logout-button").removeAttr("disabled");
             $("#courses-button").removeAttr("disabled");
             $("#login").hide();
             $("#main-menu").show();
           }
         }
  });
  return false;
}); 

$("#login-form #email").blur(function() {
  if (!$(this).val())
  {
    $("#login-form #form-group-email").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#login-form #form-group-email").removeClass("has-error");
    $("#login-form #form-group-email").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#login-form #password").blur(function() {
  if (!$(this).val())
  {
    $("#login-form #form-group-password").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#login-form #form-group-password").removeClass("has-error");
    $("#login-form #form-group-password").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#login-form #email").focus(function() {
  $("#login-form #form-group-email").removeClass("has-error");
  $("#login-form #form-group-email").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#signup-form #password").focus(function() {
  $("#login-form #form-group-password").removeClass("has-error");
  $("#login-form #form-group-password").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});
