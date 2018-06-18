$.ajax({
  type: "GET",
  url: "/users/users/",
  success: function (data)
  {
    if (!data.status) {
      showAlert(data.msg, data.level, 0);
    }
    else if (data.users.length === 0) {
      $('#page-content').loadTemplate(
        '/users/html/users-list-empty.html',
        {
          message: data.msg
        },
        {
          append: true
        }
      );
      $('#alert').addClass('alert-' + (data.level || "warning"));
    }
    else {
      $('#page-content').loadTemplate(
        '/users/html/users.html',
        {},
        {
          success: function() {
            for (var i = 0; i < data.users.length; i++) {
              let user = data.users[i]
              $("#users-list table tbody")
                .loadTemplate(
                  '/users/html/users-list-item.html',
                  {
                    number: i + 1,
                    familyName: user.familyName,
                    name: user.name,
                    patronymic: user.patronymic,
                    email: user.email || '<em>Пользователь скрыл свой email.</em>',
                    isAdministrator:
                      user.isAdministrator
                      ? '<span class="glyphicon glyphicon-asterisk" aria-hidden="true"></span>'
                      : "",
                    id: user.id,
                    href: "/#!users/profile?id=" + user.id
                  },
                  {
                    append: true
                  });
            }
          },
          append: true
        }); 
    }
  },
  error: function(data) {
    showAlert("Сервер недоступен. Попробуйте позже.", "danger");
  }
});
