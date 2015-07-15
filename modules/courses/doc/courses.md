# GET /courses/courses
Возвращает список всех курсов. Если status != true, то courses == undefined.
### Ответ:
`{ status, msg, courses }`

# /courses/findCourseById
Находит курс по его id. Если status!=1, то courses == undefined.
### Запрос: 
`{ id }`  
### Ответ:  
`{ status, msg, courses }`

# /courses/findCourseById
Находит курс по его заголовку. Если status!=1, то courses == undefined.
### Запрос: 
`{ title }`
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
