$("#courses-menu #all-courses-item").click(function() {
  $("#courses-menu").hide("slow");
  $("#content").html(courses.html["all-courses-list"]);
  $("#all-courses-list").show("slow");
  return false;
});

$("#courses-menu #teachers-item").click(function() {
  $("#courses-menu").hide("slow");
  $("#content").html(courses.html.teachers);
  $("#teachers-list").show("slow");
  return false;
});

$("#courses-menu #students-item").click(function() {
  $("#courses-menu").hide("slow");
  $("#content").html(courses.html.students);
  $("#students-list").show("slow");
  return false;
});

$("#courses-menu #my-courses-item").click(function() {
  $("#courses-menu").hide("slow");
  $("#content").html(courses.html["my-courses"]);
  $("#my-courses-list").show("slow");
  return false;
});

$("#courses-menu #my-profile-item").click(function() {
  $("#courses-menu").hide("slow");
  $("#content").html(courses.html["my-profile"]);
  $("#my-profile").show("slow");
  return false;
});
