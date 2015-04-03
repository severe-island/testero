##Установка
###linux debian/ubuntu:
* sudo apt-get install mongodb
* sudo apt-get install nodejs
* git clone https://bitbucket.org/severeisland/testero.git

##Запуск
###Перед первым запуском:
1. Перейти в папку dbSetup
2. Запустить в отдельной консоли first-run-mongodb
3. Выполнить: node first-init.js
4. Завершить процесс mongod

###Запуск:
Для запуска проекта нужно по-порядку запустить:

1. run-mongodb
2. init-db (Не обязательно. Для очистки базы и заполнения тестовыми данными.)
3. Из папки bin запустить development