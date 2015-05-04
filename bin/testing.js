var should = require('should');
var fs = require("fs") ;
var exec = require('child_process').exec;
var conf = require('../config');
var Mocha = require('mocha');
var mocha = new Mocha({
  reporter: 'spec',
  require: 'should'
});;

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

for(var i = 0; i < conf.modules.length; i++) {
  var testsPath = "../modules/" + conf.modules[i] + "/tests";
  if(!fs.existsSync(testsPath)) {
    console.log("В модуле " + conf.modules[i] + " не найдена директория tests");
    continue;
  }
  var files = fs.readdirSync(testsPath)
  if(!files) {
    console.log("В модуле " + conf.modules[i] + " не найдены тесты");
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