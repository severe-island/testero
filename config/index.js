var env = process.env.MODE || 'development' //извлекаем имя конфига из окружения,
                                            //а по-умолчанию будет 'development'
var cfg = require('./config.'+env)

module.exports = cfg