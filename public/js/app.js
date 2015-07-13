var app = {
  modules: {},
  isLoggedIn: false,
  user: {},
  page: '',
  params: {}
};

var page;

function showAlert(msg, type, delay, callback) {
  $('#content').slideUp("slow", function() {
    $(this).loadTemplate(
      '/app/html/generic-layout.html',
      {},
      {
        success: function() {
          $('#page-content').loadTemplate(
            '/app/html/alert.html',
            {},
            {
              success: function() {
                $("#alert")
                  .addClass("alert-" + type)
                  .html(msg);
                $("#content")
                  .slideDown("slow", function () {
                    if (!!delay) {
                      $(this).delay(delay)
                        .hide("slow");
                    }
                    if (callback !== undefined) {
                      callback();
                    }
                  });
              }
            }
          );
        }
      });
  });
}


function startUp() {
  $.ajax({
    type: "GET",
    url: "/users/getMe",
    success: function (data) {
      if (data.status) {
        app.user = data.user;
        app.isLoggedIn = true;
        $('*').trigger('users-login');
      }
      else {
        app.user = {};
        app.isLoggedIn = false;
        $('*').trigger('users-logout');
      }
      showAlert(data.msg, data.level, 1000, function () {
        var p = window.location.hash.slice(2).split('?');
        app.page = '/' + (p[0] || 'main') + '.json';
        app.params = $.parseParams('?' + p[1]);
        loadPage(app.page, app.params);

        if (!(window.history && history.pushState)) {
          $('[href="/#!about"]').click(function () {
            loadPage('/help/about.json');
          });
        }

        $(window).on('popstate', function () {
          var p = window.location.hash.slice(2).split('?');
          app.page = '/' + (p[0] || 'main') + '.json';
          app.params = $.parseParams('?' + p[1]);
          loadPage(app.page, app.params);
        });
      });
    }
  });
}


function placeTraps(where) {
  $(where + ' [href^="/#!"]').click(function () {
    loadPage('/' + $(this).attr('href').slice(3) + '.json');
  });
}


function loadPage(path, params) {
  function onLoadPageContent() {
    $.getScript(page.script);
    if (!(window.history && history.pushState)) {
      placeTraps('#page-content');
    }
    $("#content").slideDown("slow");
  }

  $.ajax({
    url: path,
    dataType: 'json',
    statusCode: {
      404: function () {
        loadPage('/404.json');
        return;
      }
    },
    success: function (data) {
      page = data;
      document.title = (document.title.split('-')[0] += (' - ' + page.title));
      $("#content")
        .hide("slow", function () {
          if (page.layout) {
          $(this)
            .loadTemplate(
              page.layout,
              {title: page.title},
            {
              success: function () {
                if (page.breadcrumb) {
                  $("#content #breadcrumb")
                    .loadTemplate(
                      '/app/html/breadcrumb.html',
                      {},
                      {
                        success: function () {
                          function insertItem(i) {
                            if (i < page.breadcrumb.length) {
                              var page_path = page.breadcrumb[i].page;
                              if (page_path) {
                                $.getJSON(page.breadcrumb[i].page, (function (page_path) {
                                  return function (page_item) {
                                    $("#breadcrumb-list")
                                      .loadTemplate('/app/html/breadcrumb-item.html',
                                        {
                                          url: page_item.url,
                                          title: page_item.title
                                        },
                                      {
                                        append: true,
                                        success: (function (page, page_path) {
                                          return function () {
                                            insertItem(i + 1);
                                          };
                                        })(page_item, page_path)
                                      }
                                      );
                                  };
                                })(page_path));
                              }
                              else {
                                var title = page.breadcrumb[i].title || page.title;
                                $("#breadcrumb-list")
                                  .loadTemplate('/app/html/breadcrumb-item-active.html',
                                    {
                                      title: title
                                    },
                                  {
                                    append: true,
                                    success: function () {
                                      insertItem(i + 1);
                                    }
                                  });
                              }
                            }
                            else {
                              if (!(window.history && history.pushState)) {
                                placeTraps('#breadcrumb');
                              }
                            }
                          }
                          insertItem(0);
                        }
                      });
                }
                
                if (page.content) {
                  $("#page-content")
                    .loadTemplate(
                      page.content,
                      {},
                      {
                        append: true,
                        success: onLoadPageContent,
                        error: onLoadPageContent
                      }
                    );
                }
                else {
                  onLoadPageContent();
                }
              },
              error: onLoadPageContent
            });
          }
          else {
            onLoadPageContent();
          }
        });
    },
    error: function() {
      showAlert('Сервер временно недоступен. Попробуйте обновить страницу через\n\
        некоторое время.', 'danger');
    }
  });
}


$(document).ready(function () {
  
  startUp();
  
});
