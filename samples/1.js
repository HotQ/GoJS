
function init() {
  if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
  var $ = go.GraphObject.make;

    var diagram = $(go.Diagram, "myDiagramDiv");  
    diagram.nodeTemplate =
      $(go.Node, "Auto",
        $(go.Shape,
          { figure: "RoundedRectangle", fill: "white" },  
          new go.Binding("fill", "color")
          ), 
        $(go.TextBlock,
          { margin: 5 },
          new go.Binding("text", "text", (t)=>t[0])
          )  
       );
    
    var nodeDataArray = [
      { key: "Alpha",text:"hihihi", color: "lightblue" },  
      { key: "Beta", text:"a;lijsdfo;aijf",color: "pink" }
    ];
    var linkDataArray = [
      { from: "Alpha", to: "Beta" }
    ];
    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);  
}

// Show the diagram's model in JSON format that the user may edit
function save() {
  document.getElementById("mySavedModel").value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}
function load() {
  myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
}
