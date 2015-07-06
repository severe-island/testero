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

function bootstrapAlert(msg, type, delay, callback) {
  $("#content")
    .hide("slow", function () {
      $(this).html(app.modules.app.html["alert"]);
      $("#content .alert")
        .addClass("alert-" + type)
        .html(msg);
      $("#content")
        .slideDown("slow", function () {
          $(this).delay(delay)
            .hide("slow");
          if (callback !== undefined) {
            callback();
          }
        });
    });
}

function onLoadAllModules() {
  $.ajax({
    type: "POST",
    url: "/users/isAdminExists",
    success: function (data) {
      if (!data.status) {
        $("#content")
          .hide("slow", function () {
            $(this)
              .html(app.modules.users.html["admin-account"])
              .slideDown("slow", function() {
                $("#top-menu").hide();
            });
          });
      }
      else {
        if (app.mode !== "production") {
          bootstrapAlert(data.msg, data.level, 750);
        }
        $.ajax({
          type: "POST",
          url: "/users/getMe",
          success: function (data) {
            if (data.status) {
              app.user = data.user;
              app.isLoggedIn = true;
            }
            bootstrapAlert(data.msg, data.level, 500, function () {
              tuneTopMenu();
              //showMainMenu();
            });
          }
        });
      }
    }
  });

  // Верхнее меню:

  $("#top-menu #signup-item").click(function () {
    $("#content")
      .hide("slow", function () {
        $(this)
          .html(app.modules.users.html["signup"])
          .slideDown("slow");
      });
    return false;
  });

  $("#top-menu #login-item").click(function () {
    $("#content")
      .hide("slow", function () {
        $(this)
          .html(app.modules.users.html["login"])
          .slideDown("slow");
      });
    return false;
  });

  $("#top-menu #logout-item").click(function () {
    var url = "/users/logout";
    $.ajax({
      type: "POST",
      url: url,
      success: function (data) {
        bootstrapAlert(data.msg, "info", 2000, function () {
          if (data.status) {
            app.isLoggedIn = false;
            app.user = {};
            tuneTopMenu();
            loadPage('/main.json');
          }
        });
      }
    });
    return false;
  });

  $("#top-menu #my-profile-item").click(function () {
    $("#content").hide("slow", function () {
      $(this)
        .html(app.modules.users.html["my-profile"])
        .slideDown("slow");
    });
    return false;
  });
}

var page;

function placeTraps(where) {
  $(where + ' [href^="/#!"]').click(function () {
    loadPage('/' + $(this).attr('href').slice(3) + '.json');
  });
}

function loadPage(path) {
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

                function onLoadPageContent() {
                  $.getScript(page.script);
                  if (!(window.history && history.pushState)) {
                    placeTraps('#page-content');
                  }
                  $("#content").slideDown("slow");
                }
                
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
            });
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
