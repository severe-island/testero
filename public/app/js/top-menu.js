$.getJSON('/app/top-menu.json', function (topMenu) {
  for (var i in topMenu) {
    var menuItem = topMenu[i];
    $("#top-menu").loadTemplate(
      '/app/html/top-menu-item.html',
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
              $('#top-menu [href="' + data.url + '"]').click(function () {
                loadPage(data.page);
              });
            }
          };
        })(menuItem)
      });
  }
});

$('#top-menu').click(function () {
  if (!$("#top-menu-button").hasClass('collapsed')
    && $("#top-menu-button").attr('aria-expanded')) {
    $("#navbar-top-menu")
      .removeClass('in')
      .attr('aria-expanded', false);
  }
});
