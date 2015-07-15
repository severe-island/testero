# GET /courses/courses
Возвращает список всех курсов. Если status != true, то courses == undefined.
### Ответ:
`{ status, msg, courses }`

# GET /courses/courses/:id
Находит курс по его id. Если status != true, то course == undefined.
### Ответ:  
`{ status, msg, course }`

# /courses/findCourseByTitle/?title=title
Находит курс(ы) по его заголовку (title). Если status != true, то course(s) == undefined.
### Ответ:
`{ status, msg, courses }`

# /courses/addCourse
Добавляет новый курс. status==1, если всё прошло успешно.
### Запрос: 
`{ course }`
### Ответ:
`{ status, msg}`

# /courses/updateCourse
Обновляет курс. А точнее, заменяет существующий курс на переданый серверу объект, сохраняя при этом прежний id. status==1, если всё прошло успешно.
### Запрос: 
`{ course }`
### Ответ:
`{ status, msg}`
