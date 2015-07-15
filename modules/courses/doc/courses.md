# GET /courses/courses
Возвращает список всех курсов. Если status != true, то courses == undefined.
### Ответ:
`{ status, msg, courses }`

# GET /courses/courses/:id
Находит курс по его id. Если status != true, то course == undefined.
### Ответ:  
`{ status, msg, course }`

# /courses/courses/?title=title
Находит курсы по заголовку (title). Если status != true, то courses == undefined.
### Ответ:
`{ status, msg, courses }`

# POST /courses/courses title=title i-am-author=true/false
Добавляет новый курс. status == true, если всё прошло успешно.
### Ответ:
`{ status, msg, course}`

# /courses/updateCourse
Обновляет курс. А точнее, заменяет существующий курс на переданый серверу объект, сохраняя при этом прежний id. status==1, если всё прошло успешно.
### Запрос: 
`{ course }`
### Ответ:
`{ status, msg}`
