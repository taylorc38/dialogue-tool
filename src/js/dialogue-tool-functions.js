function clearForm() {
     $("#nodeId").html("")
     $("#node-form").trigger("reset")
     $("#parentSelect").prop("disabled", false)
}

// If there is a nodeId arg in the url, we should display the form values for that node
function gotoNodeById(id) {
     location.replace(location.href + "?node=" + id)
}

function validatePrevious(parentStr) {
     if (parentStr == "") {
          throw { message : "You need to enter a parent for this node!" }
     } else if (nodeHash[parentStr] == null) {
          throw { message : "That parent doesn't exist!" }
     }
     return nodeHash[parentStr]
}

// Recursive function to delete a node and all its children
function deleteNode(masterObj, nodeHash, node) {
     // Remove all children
     for (var i = 0; i < node.connections.length; i++) {
          var child = masterObj[node.connections[i].toString()]
          deleteNode(masterObj, nodeHash, child)
     }
     var name = getNameById(nodeHash, node.nodeId)
     delete nodeHash[name]
     delete masterObj[node.nodeId.toString()]
     return { "masterObj" : masterObj, "nodeHash" : nodeHash }
}

function getNameById(hash, id) {
     for (var key in hash) {
          if (hash[key] == id)
               return key
     }
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

function drawTree(masterObj, nodeHash, node) {
     var name = getNameById(nodeHash, node.nodeId)
     var id = node.nodeId.toString()
     var htmlStr = "<li id='"+id+"'>"+name+"</li>"
     var addStr = node.connections.length > 0
          ? "<ul id='"+id+"-list' class='node-list'></ul>"
          : ""
     var parentId = node.nodeId == 0
                         ? "master-list"
                         : masterObj[node.previous.toString()].nodeId + "-list"

     $("#"+parentId).append(htmlStr + addStr)
     for (var i = 0; i < node.connections.length; i++) {
          var child = masterObj[node.connections[i].toString()]
          drawTree(masterObj, nodeHash, child)
     }
}

function renderList(masterObj, nodeHash) {
     $("#master-list li").remove()

     if (Object.keys(masterObj).length > 0)
          drawTree(masterObj, nodeHash, masterObj["0"])

     $("li").click(function() {
          var id = $(this).attr("id")
          showNode(masterObj[id.toString()], nodeHash)
     })
}

// function validateConnections(childrenStr) {
//      return childrenStr
//                .replace(/\s+/g, "")
//                .split(",")
//                .filter(function(nodeName) {
//                     var isValid = nodeHash[nodeName] != null
//                     if (!isValid)
//                          throw { message : "It looks like you've entered children nodes that don't exist!" }
//                     return isValid && nodeName != ""
//                })
//                .map(function(nodeName) {
//                     return nodeHash[nodeName]
//                })
// }

     // Append each node to the list
     // for (var i = 0; i < Object.keys(masterObj).length; i++) {
     //      var name = getNameById(nodeHash, i)
     //      $("#master-list").append(
     //           $("<li>").append(
     //                $("<a>").attr("id", name).html(name)
     //           )
     //      )
     // }
