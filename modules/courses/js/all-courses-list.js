$("#all-courses-list #courses-menu").click(function() {
  $("#content")
    .hide("slow")
    .html(app.modules.courses.html["menu"])
    .show("slow");
  return false;
});
