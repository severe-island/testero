(function () {
    "use strict"

    /* global $ app insertAlert */

    const test_id = app.params.id

    $.ajax({
        url: '/courses/tests/' + test_id,
        type: 'GET',
        success: (data) => {
            const test = data.test

            $('#page-content').loadTemplate(
                '/courses/html/test.html', {
                    task: test.task,
                    'answer-type': 'Тип ответа: ' + answerTypeForHuman(test['answer-type']) + '.'
                }, {
                    append: true,
                    success: () => {

                    }
                }
            )
        }
    })

    function answerTypeForHuman(answerType) {
        let text
        switch (answerType) {
            case 'number':
                text = 'число'
                break;
            case 'string':
                text = 'текстовая строка'
                break
            case 'select-one':
                text = 'выбор одного'
                break
            case 'select-one-or-more':
                text = 'выбор одного или более'
                break
            default:
                text = 'неизвестный формат'
                break;
        }
        return text
    }
})()
