$("#content #main-menu #courses-item").click(function () {
  $("#content").hide("slow")
    .html(app.modules.courses.html["menu"])
    .slideDown("slow");
  return false;
});
