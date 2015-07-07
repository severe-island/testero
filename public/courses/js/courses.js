$.ajax({
  type: "GET",
  url: "/courses/findAllCourses",
  success: function (data)
  {
    if (!data.status) {
      showAlert(data.msg, data.level, 0);
    }
    else if (data.courses.length === 0) {
      $('#page-content').loadTemplate(
        '/courses/html/courses-empty.html', {}, {append: true}
      );
    }
    else {
      $('#page-content').loadTemplate(
        '/courses/html/courses.html',
        {},
        {
          append: true,
          success: function() {
            for (var i = 0; i < data.courses.length; i++) {
              $("#courses-list table tbody")
                .loadTemplate('/courses/html/courses-item.html',
                  {
                    number: i + 1,
                    title: data.courses[i].title,
                    authors: ""
                  },
                  {
                    append: true
                  });
            }
        }}
      );
    }
  }
});