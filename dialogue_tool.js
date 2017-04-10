var masterObj = JSON.parse(localStorage.masterObj || "{}")
var nodeHash = JSON.parse(localStorage.nodeHash || "{}")

// Render the list
renderList(masterObj, nodeHash)

// Set the Parent Node dropdown
$("#parentSelect").append($("<option>-</option>"))
$.each(nodeHash, function(key, value) {
     $('#parentSelect')
         .append($("<option></option>")
                    .attr("value",key)
                    .text(key));
});

// Clear Storage button removes masterObj & nodehash and refreshes the page
$("#clearStorage").click(function() {
     localStorage.clear()
     location.reload()
})

$("#addBtn").click(function() {
     clearForm()
})

$("#deleteBtn").click(function() {
     var name = $("#name").val()
     if (name in nodeHash) {
          var node = masterObj[nodeHash[name].toString()]
          // Remove the connection to this node in its parent
          var parentNode = masterObj[node.previous.toString()]
          if (parentNode) {
               var i = parentNode.connections.indexOf(node.nodeId)
               parentNode.connections.splice(i, 1)
               masterObj[parentNode.nodeId.toString()] = parentNode
          }
          // Remove this node and its children
          var result = deleteNode(masterObj, nodeHash, node)
          masterObj = result.masterObj
          nodeHash = result.nodeHash

          // Save to web storage
          localStorage.masterObj = JSON.stringify(masterObj)
          localStorage.nodeHash = JSON.stringify(nodeHash)

          location.reload()
     } else {
          alert("Please enter a valid Node Name to delete")
     }
})

$("#submitBtn").click(function() {
     // If we are editing an existing node, we should use the nodeId it already has
     // We will also need to preserve its connections
     var editing = false
     if ($("#nodeId").html() != "") {
          editing = true
     }
     var nodeId = Object.keys(masterObj).length
     var connections = []
     if (editing) {
          nodeId = parseInt($("#nodeId").html())
          connections = masterObj[nodeId.toString()].connections
     }

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

     // Clear the form
     clearForm()

     // Reload the page
     location.reload()
})

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
