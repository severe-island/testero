"use strict"

/* global $ showAlert */

$("#form-add-teacher").submit(function() {
    let email = $('#email').val()

    $.ajax({
        type: 'GET',
        url: '/users/users/?email=' + email,
        success: function(data) {
            if (!data.status) {
                $("#alert")
                    .addClass("alert-" + data.level)
                    .html(data.msg)
                    .slideDown("slow");
            }
            else {
                let user_id = data.user.id
                console.log(data.msg)
                $.ajax({
                    type: "POST",
                    url: "/courses/assignRole",
                    data: {user_id: user_id, role: 'teacher'},
                    success: function(data) {
                      if (!data.status) {
                        $("#alert")
                          .addClass("alert-" + data.level)
                          .html(data.msg)
                          .slideDown("slow");
                      }
                      else {
                          showAlert(data.msg, data.level, 1000, () => {
                            history.back()
                          })
                        }
                    }
                  });
            }
        }
    })
    
    return false;
});
  