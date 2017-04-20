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
     console.log(JSON.stringify(obj))
     $("#nodeId").html(obj.nodeId)
     $("#name").val(getNameById(nodeHash, obj.nodeId))
     $("#parentSelect").val(getNameById(nodeHash, obj.previous)).prop("disabled", true)
     // For every key in our nodeTemplateMap, there's a key in our node object that holds the value for that attribute
     for (var key in nodeTemplateMap) {
          var selector = nodeTemplateMap[key]
          var matchFound = false
          for (var objKey in obj) {
               if (key.toLowerCase() == objKey.toLowerCase()) {
                    $(selector).val(obj[objKey])
                    matchFound = true
               }
          }
          if (!matchFound)
               $(selector).val("")
     }
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
     $("#master-list li").click(function() {
          var id = $(this).attr("id")
          showNode(masterObj[id.toString()], nodeHash)
     })
}

function displayTemplateTab() {
     $("#tab-content").append(
          $("<div class='container'>").append(
               $("<p>").html(
                    "Please enter the attributes you want your node to have." +
                    "</br>" +
                    "Note: all nodes will automatically have the following attributes: Node Name, Parent Node, Node id"
               )
          ).append(
               $("<ul id='template-list'>").append(
                    $("<li id='append-attr-li'>").html(
                         $("<button id='append-attr-btn' type='button' class='btn btn-primary'>").html(
                              $("<span class='glyphicon glyphicon-plus'>")
                         ).click(function() {
                              // append an attribute
                              var attributeId = "attribute-" + defaultAttrCounter
                              defaultAttrCounter++
                              $("<li id='"+attributeId+"'>").html(
                                   $("<div class='form-group'>").html(
                                        $("<textarea id='"+attributeId+"-textarea' class='form-control' rows='1'>").html(attributeId)
                                   ).append(
                                        $("<button type='button' class='btn btn-danger align-to-input'>").html(
                                             $("<span class='glyphicon glyphicon-trash'>")
                                        ).click(function() {
                                             // DELETE ATTRIBUTE
                                             // TODO using the textarea value is a sketchy way to do this...
                                             var textArea = $(this).siblings("textarea")
                                             var configIndex = configArr.indexOf(textArea.val())
                                             configArr.splice(configIndex, 1)
                                             // Remove from masterObj nodes
                                             // for (var key in masterObj) {
                                             //      for (var nodeKey in masterObj[key]) {
                                             //           if (nodeKey.toLowerCase() == textArea.val()) {
                                             //                delete masterObj[key][nodeKey]
                                             //                localStorage.masterObj = JSON.stringify(masterObj)
                                             //                break
                                             //           }
                                             //      }
                                             // }
                                             // Remove the html element
                                             $(this).parents("li").remove()
                                        })
                                   )
                              ).insertBefore($("#append-attr-li"))
                         })
                    ).append(" Add an attribute")
               ).append(
                    $("<button id='template-submit-btn' type='button' class='btn btn-primary'>").html("Save Template").click(function() {
                         // SUBMIT TEMPLATE AND GO TO NODE FORM
                         configArr = []
                         $("#template-list li").each(function(index, li) {
                              // This is our append button
                              if ($(li).attr("id") == "append-attr-li")
                                   return
                              // Enter this attribute into configArr if not already in it
                              var attributeName = $(li).find("textarea").val()
                              if (configArr.indexOf(attributeName) == -1) {
                                   configArr.push(attributeName)
                              }
                         })
                         localStorage.configArr = JSON.stringify(configArr)
                         // Now that we've created our template, switch to node view to being editing
                         localStorage.currentTabIndex = 1
                         location.reload()
                    })
               ).append(
                    $("<button id='clearTemplateBtn' type='button' class='btn btn-warning'>").html("Clear Template").click(function() {
                         // DELETE THE TEMPLATE
                         if (confirm("Are you sure?")) {
                              configArr = []
                              localStorage.configArr = JSON.stringify(configArr)
                              localStorage.nodeTemplateMap = JSON.stringify({})
                              location.reload()
                         }
                    })
               )
          )
     )
     appendConfigAttributesToTemplateTab()
}

function appendConfigAttributesToTemplateTab() {
     for (var i = 0; i < configArr.length; i++) {
          var attr = configArr[i]
          var attributeId = "attribute-" + defaultAttrCounter
          defaultAttrCounter++
          $("<li id='"+attributeId+"'>").html(
               $("<div class='form-group'>").html(
                    $("<textarea id='"+attributeId+"-textarea' class='form-control' rows='1'>").html(attr)
               ).append(
                    $("<button type='button' class='btn btn-danger align-to-input'>").html(
                         $("<span class='glyphicon glyphicon-trash'>")
                    ).click(function() {
                         var textArea = $(this).siblings("textarea")
                         var configIndex = configArr.indexOf(textArea.val())
                         configArr.splice(configIndex, 1)
                         // Remove from masterObj nodes
                         // for (var key in masterObj) {
                         //      for (var nodeKey in masterObj[key]) {
                         //           if (nodeKey.toLowerCase() == textArea.val()) {
                         //                delete masterObj[key][nodeKey]
                         //                localStorage.masterObj = JSON.stringify(masterObj)
                         //                break
                         //           }
                         //      }
                         // }
                         // Remove the html element
                         $(this).parents("li").remove()
                    })
               )
          ).insertBefore($("#append-attr-li"))
     }
}

// <form id="node-form">
//   <div class="one-line-div form-group">
//        <p><strong>Node id: </strong></p><p id="nodeId"></p>
//   </div>
//   <div class="form-group">
//          <label for="name">Node Name</label>
//          <textarea id="name" class="form-control" rows="1"></textarea>
//   </div>
//   <div class="form-group">
//         <label for="sel1">Parent Node</label>
//         <select id="parentSelect" class="form-control"></select>
//   </div>
// <!-- <button id="submitBtn" type="button" class="btn btn-primary">Submit</button> -->

function populateParentList(nodeHash) {
     $("#parentSelect").append($("<option>-</option>"))
     $.each(nodeHash, function(key, value) {
          $('#parentSelect')
              .append($("<option></option>")
                         .attr("value",key)
                         .text(key));
     });
}

// Generate html for the node form
function displayNodeTab(configArr) {
     $("#tab-content").html(
          $("<form id='node-form'>").append(
               $("<div class='one-line-div form-group'>").append(
                    $("<p><strong>Node id: </strong></p><p id='nodeId'></p>")
               )
          ).append(
               $("<div class='form-group'>").append(
                    $("<label for='name'>").html("Node Name")
               ).append(
                    $("<textarea id='name' class='form-control' rows='1'>")
               )
          ).append(
               $("<div class='form-group'>").append(
                    $("<label for='sel1'>").html("Parent Node")
               ).append(
                    $("<select id='parentSelect' class='form-control'>")
               )
          ).append(
               $("<button id='submitBtn' type='button' class='btn btn-primary'>").html("Submit")
          )
     )
     appendConfigAttributesToNodeTab(configArr)
}

function appendConfigAttributesToNodeTab(arr) {
     // Can't have two attributes with the same name
     var containedAttributes = ["nodeId", "name", "parentSelect"]
     // Parent Node attribute is conveniently guaranteed to be what we want to insert after
     var insertAfter = $("#parentSelect").parent('div')
     for (var i = 0; i < arr.length; i++) {
          var attribute = arr[i]
          var camelCase = attribute.charAt(0).toLowerCase() + attribute.slice(1).replace(/\s/g, "")
          if ($.inArray(camelCase, containedAttributes) != -1) { // -1 means it's not in the array
               alert("You can't have more than one of the same attribute!")
               continue
          }
          var html = "<div class='form-group'>" +
                         "<label for='" + camelCase + "'>" +
                              attribute +
                         "</label>" +
                         "<textarea id='" + camelCase + "' class='form-control' rows='1'>" +
                         "</textarea>" +
                    "</div>"
          $(insertAfter).after(html)
          insertAfter = $("#"+camelCase).parent('div')
          containedAttributes.push(camelCase)

          // Add to nodeTemplateMap so we know what to output in each node
          var selector = "#"+camelCase
          nodeTemplateMap[camelCase] = selector // selector is how we will access our values
     }
     localStorage.nodeTemplateMap = JSON.stringify(nodeTemplateMap)
}
