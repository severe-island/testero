$("#form-add-course").submit(function() {
  $.ajax({
    type: "POST",
    url: "/courses/courses",
    data: $("#form-add-course").serialize(),
    success: function(data)
    {
      if (!data.status) {
        $("#alert")
          .addClass("alert-" + data.level)
          .html(data.msg)
          .slideDown("slow");
      }
      else {
        history.pushState({}, "", "/#!courses/course/" + data.course.id);
      }
    }
  });
  return false;
});
