$("#signup-form").submit(function() {
  if ($(this).find("#email").val().length == 0)
  {
    $(this).find("#form-group-email").addClass("has-error");
    return false;
  }
  else
  {
    $(this).find("#form-group-email").removeClass("has-error");
    $(this).find("#form-group-email").addClass("has-success");
  }
  
  if ($(this).find("#password").val().length == 0)
  {
    $(this).find("#form-group-password").addClass("has-error");
    return false;
  }
  else
  {
    $(this).find("#form-group-password").removeClass("has-error");
    $(this).find("#form-group-password").addClass("has-success");
  }
  
  if ($(this).find("#password-duplicate").val().length == 0
    || $(this).find("#password").val() != $(this).find("#password-duplicate").val())
  {
    alert("Пароли не совпали!");
    return false;
  }
  else
  {
    $.ajax({
      type: "POST",
      url: "/users/signup",
      data: $("#signup-form").serialize(),
           success: function(data)
           {
             alert(data.msg);
             if (data.status)
             {
               $("#logout-button").removeAttr("disabled");
               $("#login-button").attr("disabled", "disabled");
               $("#signup-button").attr("disabled", "disabled");
               $("#signup").hide();
               $("#signup-submit").attr("disabled", "disabled");
               $("#main-menu").show();
             }
           }
    });
  }
  return false;
}); 

$("#signup-form #email").blur(function() {
  if (!$(this).val())
  {
    $("#signup-form #form-group-email").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#signup-form #form-group-email").removeClass("has-error");
    $("#signup-form #form-group-email").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#signup-form #password").blur(function() {
  if (!$(this).val())
  {
    $("#signup-form #form-group-password").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#signup-form #form-group-password").removeClass("has-error");
    $("#signup-form #form-group-password").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#signup-form #password-duplicate").blur(function() {
  if (!$(this).val())
  {
    $("#signup-form #form-group-password-duplicate").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#signup-form #form-group-password-duplicate").removeClass("has-error");
    $("#signup-form #form-group-password-duplicate").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#signup-form #email").focus(function() {
  $("#signup-form #form-group-email").removeClass("has-error");
  $("#signup-form #form-group-email").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#signup-form #password").focus(function() {
  $("#signup-form #form-group-password").removeClass("has-error");
  $("#signup-form #form-group-password").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#signup-form #password-duplicate").focus(function() {
  $("#signup-form #form-group-password-duplicate").removeClass("has-error");
  $("#signup-form #form-group-password-duplicate").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#agreement-dialog #accept-button").click(function() {
  $("#signup-form #signup-submit").removeAttr("disabled");
  $("#agreement-dialog").modal("hide");
});
