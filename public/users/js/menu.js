$.getJSON('/users/menu.json', function (usersMenu) {
  for (var i in usersMenu) {
    var menuItem = usersMenu[i];
    $("#users-menu").loadTemplate(
      '/users/html/menu-item.html',
      {
        id: menuItem.id + '-menu-item',
        url: menuItem.url,
        title: menuItem.title,
        class: menuItem.glyphicon ? 'glyphicon glyphicon-' + menuItem.glyphicon : ''
      },
      {
        append: true,
        success: (function (data) {
          return function () {
            if (!(window.history && history.pushState)) {
              $('#users-menu [href="' + data.url + '"]').click(function () {
                loadPage(data.page);
              });
            }
            if (app.isLoggedIn) {
              $("#users-add-user-menu-item").removeClass("disabled");
              $("#users-my-profile-menu-item").removeClass("disabled");
            }
            else {
              $("#users-add-user-menu-item").addClass("disabled");
              $("#users-my-profile-menu-item").addClass("disabled");
            }
          };
        })(menuItem)
      });
  }
});
