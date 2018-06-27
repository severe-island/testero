/* global $ app setPageTitle showAlert */

(function () {
    "use strict"
    
    const subject_id = app.params.id

    $.ajax({
        url: '/courses/subjects/' + subject_id,
        type: 'GET',
        success: (data) => {
            if (!data.status) {
                showAlert(data.msg, data.level)
                return
            }

            if (!data) {
                showAlert(data.msg, data.level)
                return
            }

            const subject = data.subject
            setPageTitle(subject.title)
            $('#page-content').loadTemplate(
                '/courses/html/subject.html', {
                    url: '/#!courses/subject/add-test?subject_id=' + subject_id
                }, {
                    append: true,
                    success: () => {
                        $.ajax({
                            url: '/courses/subjects/' + subject_id + '/tests',
                            type: 'GET',
                            success: (data) => {
                                if (!data.status) {
                                    showAlert(data.msg, data.level)
                                    return
                                }

                                const tests_ids = data.tests

                                if (!tests_ids) {
                                    showAlert(data.msg, data.level)
                                    return
                                }

                                if (tests_ids.length == 0) {
                                    $('#page-content').loadTemplate(
                                        '/courses/html/tests-empty-list.html', {}, {
                                            append: true
                                        }
                                    )
                                    return
                                }

                                getTests(tests_ids, (tests) => {
                                    $('#page-content').loadTemplate(
                                        '/courses/html/tests.html', {}, {
                                            append: true,
                                            success: () => {
                                                for (let i = 0; i < tests.length; i++) {
                                                    let test = tests[i]
                                                    $("#tests-list table tbody")
                                                        .loadTemplate('/courses/html/tests-item.html', {
                                                            number: i + 1,
                                                            id: test.id,
                                                            task: test.task,
                                                            'answer-type': test['answer-type'],
                                                            answer: test.answer,
                                                            href: "/#!courses/test?id=" + test.id
                                                        }, {
                                                            append: true
                                                        });
                                                }
                                            }
                                        }
                                    )
                                })
                            }
                        })
                    }
                })
        },
        error: (data) => {
            showAlert(data.msg, data.level)
        }
    })

    /**
     * 
     * @param {string[]} ids 
     */
    function getTests(ids, callback) {
        function getTestsRec(ids, counter, tests) {
            if (counter < ids.length) {
                $.ajax({
                    type: 'GET',
                    url: '/courses/tests/' + ids[counter],
                    success: function (data) {
                        tests.push(data.test)
                        getTestsRec(ids, counter + 1, tests)
                    }
                })
            } else {
                callback(tests)
            }
        }

        getTestsRec(ids, 0, [])
    }
})()
