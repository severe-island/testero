$("#all-courses-list #courses-menu").click(function() {
  $("#content")
    .hide("slow")
    .html(app.modules.courses.html["menu"])
    .show("slow");
  return false;
});

$.ajax({
    type: "POST",
    url: "/courses/findAllCourses",
    success: function(data)
    {
      if (!data.status) {
        bootstrapAlert(data.msg, "warning", 2000000, function() {
          return;
        });
      }
      else {
        bootstrapAlert(data.msg + " " + data.courses.length, "info", 2000000, function() {
          return;
        });
      }
    }
  });