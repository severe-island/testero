$.getJSON('/courses/menu.json', function (coursesMenu) {
  for (var i in coursesMenu) {
    var menuItem = coursesMenu[i];
    $("#courses-menu").loadTemplate(
      '/courses/html/menu-item.html',
      {
        id: menuItem.id + '-courses-menu-item',
        url: menuItem.url,
        title: menuItem.title,
        class: menuItem.glyphicon ? 'glyphicon glyphicon-' + menuItem.glyphicon : ''
      },
      {
        append: true,
        success: (function (data) {
          return function () {
            if (!(window.history && history.pushState)) {
              $('#courses-menu [href="' + data.url + '"]').click(function () {
                loadPage(data.page);
              });
            }
            if (app.isLoggedIn) {
              $("#courses-my-courses-courses-menu-item").removeClass("disabled");
              $("#courses-my-profile-courses-menu-item").removeClass("disabled");
              $("#courses-add-course-courses-menu-item").removeClass("disabled");
            }
            else {
              $("#courses-my-courses-courses-menu-item").addClass("disabled");
              $("#courses-my-profile-courses-menu-item").addClass("disabled");
              $("#courses-add-course-courses-menu-item").addClass("disabled");
            }
          };
        })(menuItem)
      });
  }
});
