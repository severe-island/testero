$.getJSON('/main/main-menu.json', function (mainMenu) {
  for (var i in mainMenu) {
    var menuItem = mainMenu[i];
    $("#main-menu").loadTemplate(
      '/main/html/main-menu-item.html',
      {
        id: menuItem.id + '-main-menu-item',
        url: menuItem.url,
        title: menuItem.title,
        class: menuItem.glyphicon ? 'glyphicon glyphicon-' + menuItem.glyphicon : ''
      },
      {
        append: true,
        success: (function (data) {
          return function () {
            if (!(window.history && history.pushState)) {
              $('#main-menu [href="' + data.url + '"]').click(function () {
                loadPage(data.page);
              });
            }
          };
        })(menuItem)
      });
  }
});
