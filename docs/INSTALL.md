# testero

## Установка

### Linux Debian/Ubuntu

Install Node.js:

`sudo apt-get install nodejs`

Install Redis:

`sudo apt install redis-server`

Install MongoDB:

Full instructions see on
[official site](https://docs.mongodb.com/master/tutorial/install-mongodb-on-ubuntu/).

``` sh
sudo apt install mongodb-org
```

Also will be installed `mongodb-org-server`, `mongodb-org-mongos`,
`mongodb-org-shell`, `mongodb-org-tools`.

Clone latest Testero:

`git clone https://github.com/severe-island/testero.git`

## Запуск

Run MongoDB

`sudo service mongod start`

Из папки `bin` запустить:

1. `production` для использования;
1. `development` для разработки;
1. `testing` для запуска тестов.

## Работа с базой данных

Пока не сделана очистка БД. Если нужно очистить, удалите:

1. `db/sessions`
1. `db/testerodb_development`

---

(c) 2015 -- 2017, Severe Island Team
