$("#admin-account-form").submit(function() {
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
      url: "/users/addAdmin",
      data: $("#admin-account-form").serialize(),
      success: function(data)
      {
        alert(data.msg);
        if (data.status) {
          $("#logout-button").removeAttr("disabled");
          $("#login-button").attr("disabled", "disabled");
          $("#signup-button").attr("disabled", "disabled");
          $("#signup-submit").attr("disabled", "disabled");
          showMainMenu();
        }
      }
    });
  }
  return false;
}); 

$("#admin-account-form #email").blur(function() {
  if (!$(this).val())
  {
    $("#admin-account-form #form-group-email").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#admin-account-form #form-group-email").removeClass("has-error");
    $("#admin-account-form #form-group-email").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#admin-account-form #password").blur(function() {
  if (!$(this).val())
  {
    $("#admin-account-form #form-group-password").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#admin-account-form #form-group-password").removeClass("has-error");
    $("#admin-account-form #form-group-password").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#admin-account-form #password-duplicate").blur(function() {
  if (!$(this).val())
  {
    $("#admin-account-form #form-group-password-duplicate").addClass("has-error");
    $(this).next("span").addClass("glyphicon-remove");
  }
  else
  {
    $("#admin-account-form #form-group-password-duplicate").removeClass("has-error");
    $("#admin-account-form #form-group-password-duplicate").addClass("has-success");
    $(this).next("span").removeClass("glyphicon-remove");
    $(this).next("span").addClass("glyphicon-ok");
  }
});

$("#admin-account-form #email").focus(function() {
  $("#admin-account-form #form-group-email").removeClass("has-error");
  $("#admin-account-form #form-group-email").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#admin-account-form #password").focus(function() {
  $("#admin-account-form #form-group-password").removeClass("has-error");
  $("#admin-account-form #form-group-password").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#admin-account-form #password-duplicate").focus(function() {
  $("#admin-account-form #form-group-password-duplicate").removeClass("has-error");
  $("#admin-account-form #form-group-password-duplicate").removeClass("has-success");
  $(this).next("span").removeClass("glyphicon-remove");
  $(this).next("span").removeClass("glyphicon-ok");
});

$("#agreement-dialog #accept-button").click(function() {
  $("#admin-account-form #signup-submit").removeAttr("disabled");
  $("#agreement-dialog").modal("hide");
});
