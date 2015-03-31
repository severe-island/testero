function require(moduleName, callback) {
  $.ajax({
    type: "POST",
    url: "/modules",
    data: { moduleName: moduleName },
    success: function(module)
    {
      callback(module);
    }
  });
}