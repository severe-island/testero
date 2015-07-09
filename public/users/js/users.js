$.ajax({
  type: "POST",
  url: "/users/findAllUsers",
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
              $("#users-list table tbody")
                .loadTemplate(
                  '/users/html/users-list-item.html',
                  {
                    number: i + 1,
                    familyName: data.users[i].familyName,
                    name: data.users[i].name,
                    patronymic: data.users[i].patronymic,
                    email: data.users[i].email,
                    isAdministrator:
                      data.users[i].isAdministrator
                      ? '<span class="glyphicon glyphicon-asterisk" aria-hidden="true"></span>'
                      : "",
                    id: data.users[i]._id,
                    href: "/#!users/profile?id=" + data.users[i]._id
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
