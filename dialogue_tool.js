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

// Assign function to submit button
$("#submitBtn").click(function() {
     // If we are editing an existing node, we should use the nodeId it already has
     var name = $("#name").val()
     var nodeId = nodeHash[name] != null
                    ? nodeHash[name]
                    : Object.keys(masterObj).length

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

     // turn form data into an object
     var obj = {
          "nodeId" : nodeId,
          "actor" : $("#actor").val(),
          "condition" : $("#condition").val(),
          "msg" : $("#message").val(),
          "type" : $("#type").val(),
          "previous" : previous,
          "connections" : []
     }

     // Store the name in a hash map
     nodeHash[name] = nodeId

     // Add to masterObj
     masterObj[obj.nodeId.toString()] = obj

     console.log(JSON.stringify(masterObj))

     // Assign this node to its parent's connections
     if (nodeId > 0)
          masterObj[previous+""].connections.push(nodeId)

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
