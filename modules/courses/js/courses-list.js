$("#courses-list #courses-menu").click(function () {
  $("#content")
    .hide("slow", function () {
      $(this)
        .html(app.modules.courses.html["menu"])
        .slideDown("slow");
    });

  return false;
});

$.ajax({
  type: "POST",
  url: "/courses/findAllCourses",
  success: function (data)
  {
    if (!data.status) {
      $("#content #alert")
        .addClass("alert-danger")
        .removeAttr("hidden")
        .html(data.msg);
    }
    else if (data.courses.length === 0) {
      $("#content #alert")
        .addClass("alert-warning")
        .removeAttr("hidden")
        .html("Пока не зарегистрировано ни одного курса.");
    }
    else {
      for (var i = 0; i < data.courses.length; i++) {
        $("#content #list table tbody")
          .loadTemplate($("#courses-list-item"),
          {
            number: i + 1,
            title: data.courses[i].title,
            authors: ""
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
