var env = process.env.MODE || 'development' //извлекаем имя конфига из окружения,
                                            //а по-умолчанию будет 'development'
var cfg = require('./'+env+'.json')

module.exports = cfg