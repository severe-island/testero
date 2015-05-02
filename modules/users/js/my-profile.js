$("#content #my-profile-menu #email").append(app.user.email);
$("#content #my-profile-menu #email-input").val(app.user.email);
$("#content #familyName").val(app.user.familyName);
$("#familyName-save-button").hide();
$("#content #name").val(app.user.name);
$("#name-save-button").hide();
$("#content #patronymic").val(app.user.patronymic);
$("#patronymic-save-button").hide();

$("#my-profile-menu #users-menu").click(function () {
  $("#content")
    .hide("slow", function () {
      $(this)
        .html(app.modules.users.html["menu"])
        .slideDown("slow");
    });

  return false;
});

$("#familyName-edit-button").click(function() {
  $("#familyName").removeAttr("disabled").focus();
  $("#familyName-edit-button").hide();
  $("#familyName-save-button").show();
});

$("#familyName-save-button").click(function() {
  $("#familyName-save-button").attr("disabled", "disabled");
  $.ajax({
    type: "POST",
    url: "/users/updateProfile",
    data: $("#user-profile-edit-form").serialize(),
    success: function (data) {
      if (app.mode !== "production") {
        $("#content #alert-familyName")
          .html(data.msg)
          .addClass("alert-" + data.level)
          .slideDown("slow", function() {
            $(this).delay(750).slideUp("slow", function() {
              $("#familyName-save-button").removeAttr("disabled");
            });
          });
      }
      if (data.status) {
        $("#familyName").attr("disabled", "disabled");
        $("#familyName-save-button").hide();
        $("#familyName-edit-button").show();
      }
    },
    error: function (data) {
      $("#content #alert-familyName")
        .html("Сервер недоступен. Попробуйте позже.")
        .addClass("alert-danger")
        .slideDown("slow", function() {
          $(this).delay(750).slideUp("slow", function() {
            $(this).removeClass("alert-danger");
          });
        });
      $("#familyName-edit-button").hide();
      $("#familyName-save-button").show();
    }
  });
  
  return false;
});

/*$("#familyName").blur(function() {
  $("#familyName").attr("disabled", "disabled");
  $("#familyName-save-button").hide();
  $("#familyName-edit-button").show();
});*/

$("#name-edit-button").click(function() {
  $("#name").removeAttr("disabled").focus();
  $("#name-edit-button").hide();
  $("#name-save-button").show();
});

$("#name-save-button").click(function() {
  $("#name-save-button").attr("disabled", "disabled");
  $.ajax({
    type: "POST",
    url: "/users/updateProfile",
    data: $("#user-profile-edit-form").serialize(),
    success: function (data) {
      if (app.mode !== "production") {
        $("#content #alert-name")
          .html(data.msg)
          .addClass("alert-" + data.level)
          .slideDown("slow", function() {
            $(this).delay(750).slideUp("slow", function() {
              $("#name-save-button").removeAttr("disabled");
            });
          });
      }
      if (data.status) {
        $("#name").attr("disabled", "disabled");
        $("#name-save-button").hide();
        $("#name-edit-button").show();
      }
    },
    error: function (data) {
      $("#content #alert-name")
        .html("Сервер недоступен. Попробуйте позже.")
        .addClass("alert-danger")
        .slideDown("slow", function() {
          $(this).delay(750).slideUp("slow", function() {
            $(this).removeClass("alert-danger");
          });
        });
      $("#name-edit-button").hide();
      $("#name-save-button").show();
    }
  });
  
  return false;
});

$("#patronymic-edit-button").click(function() {
  $("#patronymic").removeAttr("disabled").focus();
  $("#patronymic-edit-button").hide();
  $("#patronymic-save-button").show();
});

$("#patronymic-save-button").click(function() {
  $("#patronymic-save-button").attr("disabled", "disabled");
  $.ajax({
    type: "POST",
    url: "/users/updateProfile",
    data: $("#user-profile-edit-form").serialize(),
    success: function (data) {
      if (app.mode !== "production") {
        $("#content #alert-patronymic")
          .html(data.msg)
          .addClass("alert-" + data.level)
          .slideDown("slow", function() {
            $(this).delay(750).slideUp("slow", function() {
              $("#patronymic-save-button").removeAttr("disabled");
            });
          });
      }
      if (data.status) {
        $("#patronymic").attr("disabled", "disabled");
        $("#patronymic-save-button").hide();
        $("#patronymic-edit-button").show();
      }
    },
    error: function (data) {
      $("#content #alert-patronymic")
        .html("Сервер недоступен. Попробуйте позже.")
        .addClass("alert-danger")
        .slideDown("slow", function() {
          $(this).delay(750).slideUp("slow", function() {
            $(this).removeClass("alert-danger");
          });
        });
      $("#patronymic-edit-button").hide();
      $("#patronymic-save-button").show();
    }
  });
  
  return false;
});

$("#content #my-profile-menu #user-logout-item").click(function() {
  $.ajax({
    type: "POST",
    url: "/users/logout",
    success: function (data) {
      bootstrapAlert(data.msg, "info", 2000, function () {
        if (data.status) {
          app.isLoggedIn = false;
          app.user = {};
          tuneTopMenu();
          showMainMenu();
        }
      });
    }
  });
  return false;
});


$("#user-password-edit-dialog #save-button").click(function() {
  $("#user-edit-password-form #email").val(app.user.email);
  $.ajax({
    type: "POST",
    url: "/users/updatePassword",
    data: $("#user-edit-password-form").serialize(),
    success: function (data) {
      $("#user-password-edit-dialog #alert-password")
        .addClass("alert-" + data.level)
        .html(data.msg)
        .slideDown("slow", function() {
          $(this)
            .delay(1000)
            .slideUp("slow");
        });
    },
    error: function (data) {
      $("#user-password-edit-dialog #alert-password")
        .addClass("alert-danger")
        .html("Сервер недоступен. Попробуйте позже.")
        .slideDown("slow", function() {
          $(this)
            .delay(1000)
            .slideUp("slow");
        });
    }
  });
  return false;
});
