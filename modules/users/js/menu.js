$("#users-menu #users-list-item").click(function() {
  $("#content").hide("slow", function() {
    $(this)
      .html(app.modules.users.html["users-list"]);
  });
  return false;
});

$("#users-menu #add-user-item").click(function() {
  $("#content").hide("slow", function() {
    $(this)
      .html(app.modules.users.html["add-user"]);
  });
  return false;
});

$("#users-menu #my-profile-item").click(function() {
  $("#content").hide("slow", function() {
    $(this)
      .html(app.modules.users.html["my-profile"])
      .show("slow");
  });
  return false;
});
