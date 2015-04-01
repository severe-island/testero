var mongoose = require('mongoose');

var schemas = {};
schemas['user'] = new mongoose.Schema({
            email: {type: String},
            password: {type: String},
            permission: {type: String, default: "none"}},
        {collection: 'users'});
        
var models = {};
models['user'] =  mongoose.connection.model("user", schemas['user']);

module.exports.schemas = schemas;
module.exports.models = models;