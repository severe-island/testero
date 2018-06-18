"use strict"

$.ajax({
    type: "GET",
    url: "/courses/roles/?role=teacher",
    success: function (data) {
      if (!data.status) {
        showAlert(data.msg, data.level, 0);
      }
      else if (data.users.length === 0) {
        $('#page-content').loadTemplate(
          '/courses/html/teachers-empty-list.html', {}, {append: true}
        );
      }
      else {
        getUsers(data.users, (users) => {
          $('#page-content').loadTemplate(
            '/courses/html/teachers.html',
            {},
            {
              append: true,
              success: function() {
                for (var i = 0; i < users.length; i++) {
                  let user = users[i]
                  $("#teachers-list table tbody")
                    .loadTemplate('/courses/html/teachers-item.html',
                      {
                        number: i + 1,
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        familyName: user.familyName,
                        patronymic: user.patronymic,
                        isAdministrator: user.isAdministrator
                          ?'<span class="glyphicon glyphicon-asterisk" aria-hidden="true"></span>'
                          : "",
                        href: "/#!users/profile?id=" + user.id
                      },
                      {
                        append: true
                      });
                }
            }}
          );
        })
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
        showAlert(textStatus + ': ' + errorThrown, 'danger', 0)
    }
});

/**
 * 
 * @param {string[]} ids 
 */
function getUsers(ids, callback) {
  function getUsersRec(ids, counter, users) {
    if (counter < ids.length) {
      $.ajax({
        type: 'GET',
        url: '/users/users/' + ids[counter],
        success: function(data) {
          users.push(data.user)
          getUsersRec(ids, counter + 1, users)
        }
      })
    }
    else {
      callback(users)
    }
  }
  
  getUsersRec(ids, 0, [])
}
