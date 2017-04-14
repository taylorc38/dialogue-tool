// Retrieve from web storage and render our node tree
var masterObj = JSON.parse(localStorage.masterObj || "{}")
var nodeHash = JSON.parse(localStorage.nodeHash || "{}")
renderList(masterObj, nodeHash)

/* ************* Populate parent list ****************** */

$("#parentSelect").append($("<option>-</option>"))
$.each(nodeHash, function(key, value) {
     $('#parentSelect')
         .append($("<option></option>")
                    .attr("value",key)
                    .text(key));
});

/* *************** Button handlers ****************** */

$("#addBtn").click(function() {
     clearForm()
})

$("#deleteBtn").click(function() {
     var name = $("#name").val()
     try {
          var result = removeFromTree(masterObj, nodeHash, name)
          masterObj = result.masterObj
          nodeHash = result.nodeHash

          // Save to web storage
          localStorage.masterObj = JSON.stringify(masterObj)
          localStorage.nodeHash = JSON.stringify(nodeHash)
          location.reload()
     } catch (err) {
          alert(err.message)
     }
})

$("#submitBtn").click(function() {
     // Since user can't change nodeId, we can use it to determine whether we are editing a node or creating a new one
     var editing = ($("#nodeId").html() != "")

     // If we are editing an existing node, we should use the nodeId it already has
     var nodeId = (editing)
                    ? parseInt($("#nodeId").html())
                    : Object.keys(masterObj).length

     // We will also need to preserve its connections
     var connections = (editing)
                         ? masterObj[nodeId.toString()].connections
                         : []

     // Validate previous and convert to nodeId
     var previous = -1
     var parentStr = $("#parentSelect").val()
     if (nodeId > 0) { // Corner case, root node will not need a previous node
          try {
               previous = validatePrevious(parentStr)
          } catch (err) {
               alert(err.message)
               return
          }
     }

     // Assign this node to its parent's connections if it's new
     if (nodeId > 0 && !editing)
          masterObj[previous+""].connections.push(nodeId)

     // turn form data into an object
     var obj = {
          "nodeId" : nodeId,
          "actor" : $("#actor").val(),
          "condition" : $("#condition").val(),
          "msg" : $("#message").val(),
          "type" : $("#type").val(),
          "previous" : previous,
          "connections" : connections
     }

     // Store the name in a hash map
     // If we are editing a node, we need to figure out if the name has changed
     // If so, we need to change the hash key for this nodeId
     var name = $("#name").val()
     if (nodeHash[name] == null){
          for (var key in nodeHash) {
               if (nodeHash[key] == nodeId) {
                    // We've found this node under a different name, which means the name has been changed
                    delete nodeHash[key]
                    nodeHash = JSON.parse(JSON.stringify(nodeHash))
                    break
               }
          }
     }
     nodeHash[name] = nodeId

     // Add to masterObj
     masterObj[obj.nodeId.toString()] = obj

     // Save to web storage
     localStorage.masterObj = JSON.stringify(masterObj)
     localStorage.nodeHash = JSON.stringify(nodeHash)

     // Reload the page
     location.reload()
})

// Clear Storage button removes masterObj & nodehash and refreshes the page
$("#clearStorage").click(function() {
     if (confirm("Are you sure?")) {
          localStorage.clear()
          location.reload()
     }
})

/* ************* File Input ************** */

var handleFileSelect = function(event) {
     var file = event.target.files[0]
     var reader = new FileReader()
     reader.readAsText(file)
     reader.onload = function() {
          if (confirm("Are you sure you want to import this file?")) {
               try {
                    var content = JSON.parse(reader.result)
                    masterObj = content
                    nodeHash = {}
                    // create a new nodeHash, nodeId will be used as default node name
                    for (var key in masterObj) {
                         var node = masterObj[key]
                         var name = "Node" + node.nodeId
                         nodeHash[name] = node.nodeId
                    }
                    // Save to web storage
                    localStorage.masterObj = JSON.stringify(masterObj)
                    localStorage.nodeHash = JSON.stringify(nodeHash)
                    location.reload()
               } catch (err) {
                    alert("There was an error importing your file: " + err)
                    $("#fileInput").val("") // reset file input element
               }
          }
     }
}

// Set file input event handler
if (window.File && window.FileReader) {
      $("#fileInput").change(function(event) {
           handleFileSelect(event)
      })
} else {
     alert("Your browser doesn't support importing JSON files. Sorry!");
     $("#fileInput").prop("disabled", true)
}

/* **************** Export ****************** */

// Basically creates a link that downloads the json file, simulates a click, then removes it
$("#downloadBtn").click(function() {
     var filename = $("#title").val() != ""
                         ? $("#title").val() + ".json"
                         : "conversation.json"
     $("<a />", {
          "download": filename,
          "href" : "data:application/json;charset=utf-8,"
               + encodeURIComponent(JSON.stringify(masterObj, null, "\t"))
     }).appendTo("body")
     .click(function() {
          $(this).remove()
     })[0].click()
})
