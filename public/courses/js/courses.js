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
        '/courses/html/courses.html', {}, {success: function() {
            for (var i = 0; i < data.courses.length; i++) {
              $("#content #list table tbody")
                .loadTemplate('/courses/html/courses-item',
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
      
      //$("#content #list").removeAttr("hidden");
    }
    //$("#content").slideDown("slow");
  }
});
