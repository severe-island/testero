"use strict"

/* global $ showAlert */

$.ajax({
  type: "GET",
  url: "/courses/courses",
  success: function (data)
  {
    $('#page-content').loadTemplate(
      '/courses/html/courses-menu.html',
      {},
      {
        append: true,
        success: () => {
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
                    let course = data.courses[i]
                    $("#courses-list table tbody")
                      .loadTemplate('/courses/html/courses-item.html',
                        {
                          number: i + 1,
                          title: course.title,
                          authors: "",
                          id: course.id,
                          href: "/#!courses/course?id=" + course.id
                        },
                        {
                          append: true
                        });
                  }
              }});
          }
        }
      })
  }
});
