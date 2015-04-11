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
        .html(msg);
    }
    else if (data.courses.length === 0) {
      $("#content #alert")
        .addClass("alert-warning")
        .html("Пока не зарегистрировано ни одного курса.");
    }
    else {
      $("#content #alert")
        .addClass("alert-info")
        .html("Здесь будет список курсов...");
      for (var i = 0; i < data.courses.length; i++) {
        $("#content #list table td").last().append("<td>" + data.courses[i].title + "</td>");
      }
      
    }
    $("#content").slideDown("slow");
  }
});
