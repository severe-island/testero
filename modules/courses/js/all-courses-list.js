$("#all-courses-list #courses-menu").click(function () {
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
        .addClass("alert-error")
        .removeAttr("hidden")
        .html(msg);
    }
    else if (data.courses.length === 0) {
      $("#content #alert")
        .addClass("alert-warning")
        .removeAttr("hidden")
        .html("Пока не зарегистрировано ни одного курса.");
    }
    else {
      $("#content #list table tbody")
        .html("<tr><td>1</td><td>" + data.courses[0].title + "</td></tr>");
      for (var i = 1; i < data.courses.length; i++) {
        $("#content #list table tr")
          .last()
          .after("<tr><td>" + (i + 1) + "</td><td>" + data.courses[i].title + "</td></tr>");
      }
      $("#content #list").removeAttr("hidden");
    }
    $("#content").slideDown("slow");
  }
});
