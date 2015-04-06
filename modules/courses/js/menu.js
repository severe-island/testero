$("#courses-menu #all-list").click(function() {
  $("#courses-menu").hide("slow");
  $("#content").html(courses.html.list);
  $("#courses-list").show("slow");
  return false;
});
