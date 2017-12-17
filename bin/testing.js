"use strict"

const fs = require("fs")
const exec = require('child_process').exec
const Mocha = require('mocha')
const should = require('should')
const mocha = new Mocha({
  reporter: 'spec',
  require: 'should'
})

const config = require('config')

function deleteFolderRecursive(path) {
  var files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

deleteFolderRecursive("../db/testing");

for(var i = 0; i < config.modules.length; i++) {
  var testsPath = "modules/" + config.modules[i] + "/tests";
  if(!fs.existsSync(testsPath)) {
    console.log("В модуле " + config.modules[i] + " не найдена директория tests");
    continue;
  }
  var files = fs.readdirSync(testsPath)
  if(!files) {
    console.log("В модуле " + config.modules[i] + " не найдены тесты");
    continue;
  }
  files.forEach(function(filename){
    mocha.addFile(testsPath + "/" + filename)
  });
}

mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});