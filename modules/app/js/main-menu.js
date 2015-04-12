$("#content #main-menu #courses-item").click(function () {
  $("#content").hide("slow", function() {
    $(this)
      .html(app.modules.courses.html["menu"])
      .slideDown("slow");
  });
  return false;
});

$("#content #main-menu #users-item").click(function () {
  $("#content").hide("slow", function() {
    $(this)
      .html(app.modules.users.html["menu"])
      .slideDown("slow");
  });
  return false;
});

$("#content #main-menu #my-profile-item").click(function () {
  $("#content").hide("slow", function() {
    $(this)
      .html(app.modules.users.html["my-profile"])
      .slideDown("slow");
  });
  return false;
});
