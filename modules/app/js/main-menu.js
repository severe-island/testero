$("#content #main-menu #courses-item").click(function() {
    $("#content").hide("slow");
    $("#content").html(courses.html["menu"]);
    $("#content").show("slow");
    return false;
  });
  