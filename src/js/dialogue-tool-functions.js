function clearForm() {
     $("#nodeId").html("")
     $("#node-form").trigger("reset")
     $("#parentSelect").prop("disabled", false)
}

function getNameById(hash, id) {
     for (var key in hash) {
          if (hash[key] == id)
               return key
     }
}

// Makes sure the parent has been specified and exists before attaching a new node
function validatePrevious(parentStr) {
     if (parentStr == "") {
          throw { message : "You need to enter a parent for this node!" }
     } else if (nodeHash[parentStr] == null) {
          throw { message : "That parent doesn't exist!" }
     }
     return nodeHash[parentStr]
}

function removeFromTree(masterObj, nodeHash, name) {
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

          // Remove this node and its children recursively
          return deleteNode(masterObj, nodeHash, node)
     } else {
          throw { message: "Please enter a valid node name to delete" }
     }
}

// Recursive helper function to delete a node and all its children
function deleteNode(masterObj, nodeHash, node) {
     // Remove all children
     for (var i = 0; i < node.connections.length; i++) {
          var child = masterObj[node.connections[i].toString()]
          deleteNode(masterObj, nodeHash, child)
     }
     // Remove this node from masterObj and nodeHash
     var name = getNameById(nodeHash, node.nodeId)
     delete nodeHash[name]
     delete masterObj[node.nodeId.toString()]
     return { "masterObj" : masterObj, "nodeHash" : nodeHash }
}


function showNode(obj, nodeHash) {
     $("#nodeId").html(obj.nodeId)
     $("#name").val(getNameById(nodeHash, obj.nodeId))
     $("#actor").val(obj.actor)
     $("#condition").val(obj.condition)
     $("#message").val(obj.msg)
     $("#type").val(obj.type)
     $("#parentSelect").val(getNameById(nodeHash, obj.previous)).prop("disabled", true)
}

/*
Recursive function to generate HTML to represent our dialogue tree
Example:
     <ul id="master-list">
          <li id="0">root</li>
          <ul id="0-children">
               <li id="1">NodeA</li>
               <ul id="1-children">
                    <li id="2">NodeB</li>
               </ul>
          </ul>
     </ul>
*/
function drawTree(masterObj, nodeHash, node) {
     // Create the html string for this node
     var name = getNameById(nodeHash, node.nodeId)
     var id = node.nodeId.toString()
     var htmlStr = "<li id='"+id+"'>"+name+"</li>"
     var addStr = node.connections.length > 0
          ? "<ul id='"+id+"-children' class='node-list'></ul>"
          : ""
     // Append this node to its parent
     var parentId = node.nodeId == 0
                    ? "master-list"
                    : masterObj[node.previous.toString()].nodeId + "-children"
     $("#"+parentId).append(htmlStr + addStr)
     // Repeat this process for each child of this node
     for (var i = 0; i < node.connections.length; i++) {
          var child = masterObj[node.connections[i].toString()]
          drawTree(masterObj, nodeHash, child)
     }
}

function renderList(masterObj, nodeHash) {
     // Clear the previously generated html
     $("#master-list li").remove()
     // Generate more of it
     if (Object.keys(masterObj).length > 0)
          drawTree(masterObj, nodeHash, masterObj["0"])
     // Assign click handler for each node <li>
     $("li").click(function() {
          var id = $(this).attr("id")
          showNode(masterObj[id.toString()], nodeHash)
     })
}
