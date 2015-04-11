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
          .addClass("alert-error")
          .html(msg);
      }
    }
  });
  return false;
});

$("#content").slideDown("slow");
