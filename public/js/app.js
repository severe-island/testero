var app = {
  modules: {},
  isLoggedIn: false,
  user: {}
};
var modules = ["app", "users", "courses"];

function tuneTopMenu() {
  if (app.isLoggedIn) {
    $("#users-login-top-menu-item").hide();
    $("#users-signup-top-menu-item").hide();
    $("#users-my-profile-top-menu-item").show();
    $("#users-logout-top-menu-item").show();
    $("#courses-top-menu-item").show();
  }
  else {
    $("#users-login-top-menu-item").show();
    $("#users-signup-top-menu-item").show();
    $("#users-my-profile-top-menu-item").hide();
    $("#users-logout-top-menu-item").hide();
    $("#courses-top-menu-item").hide();
  }
}

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
                    if (delay !== 0) {
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

function onLoadAllModules() {
  $.ajax({
    type: "GET",
    url: "/users/isAdminExists",
    success: function (data) {
      if (!data.status) {
        loadPage('/users/admin-account.json');
      }
      else {
        if (app.mode !== "production") {
          showAlert(data.msg, data.level, 750);
        }
        $.ajax({
          type: "GET",
          url: "/users/getMe",
          success: function (data) {
            if (data.status) {
              app.user = data.user;
              app.isLoggedIn = true;
            }
            showAlert(data.msg, data.level, 500, function () {
              tuneTopMenu();
              loadPage('/main.json');
            });
          }
        });
      }
    }
  });
}

var page;

function placeTraps(where) {
  $(where + ' [href^="/#!"]').click(function () {
    loadPage('/' + $(this).attr('href').slice(3) + '.json');
  });
}

function loadPage(path) {
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
    }
  });
}

$(document).ready(function () {
  
  $.getScript('/app/js/top-menu.js');
  
  loadPage('/' + (window.location.hash.slice(2) || 'main') + '.json');
  
  if (!(window.history && history.pushState)) {
    $('[href="/#!about"]').click(function () {
      loadPage('/help/about.json');
    });
  }
  
  $(window).on('popstate', function() {
    loadPage('/' + (window.location.hash.slice(2) || 'main') + '.json');
  });
  
  $.ajax({
    type: "POST",
    url: "/app",
    success: function (data)
    {
      app = data;
      onLoadAllModules();
    }
  });
});
