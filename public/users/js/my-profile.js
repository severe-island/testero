var user;

$.ajax({
  type: 'GET',
  url: '/users/users/' + localStorage.user_id + '/auth',
  success: function(data) {
    if (data.status) {
      $.ajax({
        type: 'GET',
        url: '/users/users/' + localStorage.user_id,
        success: function(data) {
          user = data.user;
          $("#user-profile-edit-form #email").append(user.email);
          $("#user-profile-edit-form #email-input").val(user.email);
          $("#user-profile-edit-form #familyName").val(user.familyName);
          $("#user-profile-edit-form #familyName-save-button").hide();
          $("#user-profile-edit-form #name").val(user.name);
          $("#user-profile-edit-form #name-save-button").hide();
          $("#user-profile-edit-form #patronymic").val(user.patronymic);
          $("#user-profile-edit-form #patronymic-save-button").hide();
        },
        error: function() {
          showAlert('Ошибка сервера.', 'danger');
        }
      });
    }
    else {
      user = {};
      showAlert(data.msg, data.level);
    }
  },
  error: function() {
    showAlert('Ошибка сервера.', 'danger');
  }
});

$("#familyName-edit-button").click(function() {
  $("#familyName").removeAttr("disabled").focus();
  $("#familyName-edit-button").hide();
  $("#familyName-save-button").show();
});

$("#familyName-save-button").click(function() {
  $("#familyName-save-button").attr("disabled", "disabled");
  $.ajax({
    type: "PATCH",
    url: "/users/users/" + localStorage.user_id,
    data: $("#user-profile-edit-form").serialize(),
    success: function (data) {
      if (app.mode !== "production") {
        $("#alert-familyName")
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
      $("#alert-familyName")
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
    type: "PATCH",
    url: "/users/users/" + localStorage.user_id,
    data: $("#user-profile-edit-form").serialize(),
    success: function (data) {
      if (app.mode !== "production") {
        $("#alert-name")
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
      $("#alert-name")
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
    type: "PATCH",
    url: "/users/users/" + localStorage.user_id,
    data: $("#user-profile-edit-form").serialize(),
    success: function (data) {
      if (app.mode !== "production") {
        $("#alert-patronymic")
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
      $("#alert-patronymic")
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

$("#user-password-edit-dialog #save-button").click(function() {
  $("#user-edit-password-form #email").val(app.user.email);
  $.ajax({
    type: "PATCH",
    url: "/users/users/" + localStorage.user_id,
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
