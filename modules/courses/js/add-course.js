$("#add-course #courses-menu").click(function() {
  $("#content")
    .hide("slow", function() {
      $(this)
      .html(app.modules.courses.html["menu"])
      .slideDown("slow");
    });
    
  return false;
});

$("#add-course-form").submit(function() {
  $.ajax({
    type: "POST",
    url: "/courses/addCourse",
    data: $("#add-course-form").serialize(),
    success: function(data)
    {
      if (!data.status) {
        $("#content #alert")
          .addClass("alert-" + data.level)
          .html(data.msg)
          .slideDown("slow");
      }
    }
  });
  return false;
});

$("#content").slideDown("slow");
