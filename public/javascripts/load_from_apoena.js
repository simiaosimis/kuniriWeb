
id = document.getElementById("class_diagram").getAttribute("userID")
project_name = window.location.search.split("=")[1]

apo.reloadCanvas("class_diagram")
import_class(id+"_id"+"/"+project_name+"/class_data.xml")
apo.draw()

//public/'id_user'_id/projectName/class_data.xml
