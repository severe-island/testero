$("#users-list #users-menu").click(function () {
  $("#content")
    .hide("slow", function () {
      $(this)
        .html(app.modules.users.html["menu"])
        .slideDown("slow");
    });

  return false;
});

$.ajax({
  type: "POST",
  url: "/users/findAllUsers",
  success: function (data)
  {
    if (!data.status) {
      var alertType = data.level;
      if (!alertType){
        alertType = "error";
      }
      $("#content #alert")
        .addClass("alert-" + alertType)
        .removeAttr("hidden")
        .html(msg);
    }
    else if (data.users.length === 0) {
      var alertType = data.level;
      if (!alertType){
        alertType = "warning";
      }
      $("#content #alert")
        .addClass("alert-" + alertType)
        .removeAttr("hidden")
        .html(msg);
    }
    else {
      for (var i = 0; i < data.users.length; i++) {
        $("#content #list table tbody")
          .loadTemplate($("#users-list-item"),
            {
              number: i + 1,
              email: data.users[i].email,
              isAdministrator: data.users[i].isAdministrator ? '<span class="glyphicon glyphicon-asterisk" aria-hidden="true"></span>' : ""
            },
            {
              append: true
            });
      }
      $("#content #list").removeAttr("hidden");
    }
    $("#content").slideDown("slow");
  }
});
