"use strict"

/* global $ app showAlert */

$('#form-add-test').submit(() => {
    $.ajax({
        type: 'POST',
        url: '/courses/subjects/' + app.params.subject_id +'/tests',
        data: {
            task: $('#task').val(),
            'answer-type': $('#answer-type').val(),
            'answer': $('#answer').val()
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
