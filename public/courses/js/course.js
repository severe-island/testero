"use strict"

/* global $ app setPageTitle showAlert */

$.ajax({
    type: 'GET',
    url: '/courses/courses/' + app.params.id,
    success: (data) => {
        if (data.status) {
            let course = data.course
            setPageTitle(course.title)
            $('#page-content').loadTemplate(
                '/courses/html/course-menu.html',
                {
                    url: '/#!courses/add-subject?course_id=' + course.id
                },
                {
                  append: true,
                  success: () => {
                    $.ajax({
                        type: 'GET',
                        url: '/courses/courses/' + course.id +'/subjects',
                        success: (data) => {
                            if (data.status) {
                                if (data.subjects.length > 0) {
                                    getSubjects(data.subjects, (subjects) => {
                                        console.dir(subjects)
                                        $('#page-content').loadTemplate(
                                          '/courses/html/course-subjects.html',
                                          {},
                                          {
                                            append: true,
                                            success: function() {
                                              for (var i = 0; i < subjects.length; i++) {
                                                let subject = subjects[i]
                                                $("#subjects-list table tbody")
                                                  .loadTemplate('/courses/html/course-subjects-item.html',
                                                    {
                                                      number: i + 1,
                                                      id: subject.id,
                                                      title: subject.title,
                                                      href: "/#!courses/subject?id=" + subject.id
                                                    },
                                                    {
                                                      append: true
                                                    });
                                              }
                                          }}
                                        );
                                      })
                                } else {
                                    $('#page-content').loadTemplate(
                                        '/courses/html/course-subjects-empty-list.html', {}, {append: true});
                                }
                            }
                            else {
                                showAlert(data.msg, data.level)
                            }
                        },
                        error: () => {
                            showAlert('Ошибка сервера, попробуйте позже.', 'danger')
                        }
                    })
                    $('#page-content').loadTemplate(
                        '/courses/html/course.html',
                        {
                        },
                        {
                          append: true
                        })
                  }
                })
        }
        else {
            showAlert(data.msg, data.level)
        }
    },
    error: () => {
        showAlert('Ошибка сервера, попробуйте позже.', 'danger')
    }
})

/**
 * 
 * @param {string[]} ids 
 */
function getSubjects(ids, callback) {
    function getSubjectsRec(ids, counter, subjects) {
      if (counter < ids.length) {
        $.ajax({
          type: 'GET',
          url: '/courses/subjects/' + ids[counter],
          success: function(data) {
            subjects.push(data.subject)
            getSubjectsRec(ids, counter + 1, subjects)
          }
        })
      }
      else {
        callback(subjects)
      }
    }
    
    getSubjectsRec(ids, 0, [])
}
