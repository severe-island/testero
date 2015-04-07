$("#all-courses-list #courses-menu").click(function() {
  $("#all-courses-list").hide("slow");
  $("#content").html(courses.html["menu"]);
  $("#courses-menu").show("slow");
  return false;
});
