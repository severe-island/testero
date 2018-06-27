"use strict"

/* global $ app showAlert */

$('#form-add-subject').submit(() => {
    $.ajax({
        type: 'POST',
        url: '/courses/courses/' + app.params.course_id +'/subjects',
        data: {
            title: $('#title').val(),
            'i-am-author': $('#i-am-author').val()
        },
        success: (data) => {
            if (data.status) {
                showAlert(data.msg, data.level, 1000, () => {
                    window.history.back()
                })
            }
            else {
                showAlert(data.msg, data.level)
            }
        }
    })
    return false;
})
