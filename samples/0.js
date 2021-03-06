
function init() {
  if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
  var $ = go.GraphObject.make;



  myDiagram =
    $(go.Diagram, "myDiagramDiv",
      {
        initialContentAlignment: go.Spot.Left,
        initialAutoScale: go.Diagram.UniformToFill,

        layout:
          $(go.LayeredDigraphLayout,
            { direction: 0, layerSpacing: 0, columnSpacing: 10, setsPortSpots: false }),

        "undoManager.isEnabled": true
      }
    );

  // when the document is modified, add a "*" to the title and enable the "Save" button
  myDiagram.addDiagramListener("Modified", function (e) {
    var button = document.getElementById("SaveButton");
    if (button) button.disabled = !myDiagram.isModified;
    var idx = document.title.indexOf("*");
    if (myDiagram.isModified) {
      if (idx < 0) document.title += "*";
    } else {
      if (idx >= 0) document.title = document.title.substr(0, idx);
    }
  });

  function makePort(name, leftside, side) {
    var port = $(go.Shape, "Rectangle",
      {
        fill: "gray", stroke: null,
        desiredSize: new go.Size(8, 8),
        portId: name,  // declare this object to be a "port"
        toMaxLinks: 1,  // don't allow more than one link into a port
        cursor: "touch"  // show a different cursor to indicate potential link point
      });

    var lab = $(go.TextBlock, name,  // the name of the port
      { font: "7pt sans-serif" });

    var panel;
    // set up the port/panel based on which side of the node it will be on
    if (side === undefined) {
      panel = $(go.Panel, "Horizontal",
        { margin: new go.Margin(2, 0) });

      if (leftside) {
        port.toSpot = go.Spot.Left;
        port.toLinkable = true;
        lab.margin = new go.Margin(1, 0, 0, 1);
        panel.alignment = go.Spot.TopLeft;
        panel.add(port);
        panel.add(lab);
      } else {
        port.fromSpot = go.Spot.Right;
        port.fromLinkable = true;
        lab.margin = new go.Margin(1, 1, 0, 0);
        panel.alignment = go.Spot.TopRight;
        panel.add(lab);
        panel.add(port);
      }

    } else {

      if (side === go.Spot.Top) {
        panel = $(go.Panel, "Vertical",
          { margin: new go.Margin(2, 0) });

        port.toSpot = go.Spot.Top;
        port.toLinkable = true;
        lab.margin = new go.Margin(0, 0, 0, 0);
        panel.alignment = go.Spot.Top;
        panel.add(port);
        panel.add(lab);
      }
    }


    return panel;
  }

  function makeTemplate(typename, background, inports, outports, saveposts) {
    if (saveposts === undefined) { saveposts = [] }
    var node = $(go.Node, "Spot",
      $(go.Panel, "Auto",
        { width: 100, height: 120 },
        $(go.Shape, "RoundedRectangle",
          {
            fill: background, stroke: null, strokeWidth: 0,
            spot1: go.Spot.TopLeft, spot2: go.Spot.BottomRight
          }),
        $(go.Panel, "Table",
          $(go.TextBlock, typename,
            {
              row: 0,
              margin: 3,
              maxSize: new go.Size(80, NaN),
              stroke: "white",
              font: "bold 11pt sans-serif"
            }),
          // $(go.Picture, icon,
          //   { row: 1, width: 55, height: 55 }),
          $(go.TextBlock,
            {
              row: 2,
              margin: 3,
              editable: true,
              maxSize: new go.Size(80, 40),
              stroke: "white",
              font: "bold 9pt sans-serif"
            },
            new go.Binding("text", "name").makeTwoWay())
        )
      ),
      $(go.Panel, "Vertical",
        {
          alignment: go.Spot.Left,
          alignmentFocus: new go.Spot(0, 0.5, 8, 0)
        },
        inports),
      $(go.Panel, "Vertical",
        {
          alignment: go.Spot.Right,
          alignmentFocus: new go.Spot(1, 0.5, -8, 0)
        },
        outports)
      ,
      $(go.Panel, "Horizontal",
        {
          alignment: go.Spot.Top,
          alignmentFocus: new go.Spot(1, 0.5, -8, 0)
        },
        saveposts)
    );
    myDiagram.nodeTemplateMap.set(typename, node);
  }

  makeTemplate("Table", "forestgreen",
    [],
    [makePort("OUT", false)]);

  makeTemplate("Join", "mediumorchid",
    [makePort("L", true), makePort("R", true)],
    [makePort("UL", false), makePort("ML", false), makePort("M", false), makePort("MR", false), makePort("UR", false)]);

  makeTemplate("Project", "darkcyan",
    [makePort("", true)],
    [makePort("OUT", false)]);

  makeTemplate("Filter", "cornflowerblue",
    [makePort("", true)],
    [makePort("OUT", false), makePort("INV", false)]);

  makeTemplate("Group", "mediumpurple",
    [makePort("", true)],
    [makePort("OUT", false)]);

  makeTemplate("Sort", "sienna",
    [makePort("", true)],
    [makePort("OUT", false)]);

  makeTemplate("Export", "darkred",
    [],
    [],
    [makePort("A", true, go.Spot.Top)]);

  myDiagram.linkTemplate =
    $(go.Link,
      {
        routing: go.Link.AvoidsNodes,
        curve: go.Link.JumpOver,
        layoutConditions: go.Part.LayoutAdded | go.Part.LayoutRemoved,

        corner: 30,
        relinkableFrom: true, relinkableTo: true
      },
      $(go.Shape, { stroke: "gray", strokeWidth: 2 }),
      $(go.Shape, { stroke: "gray", fill: "gray", toArrow: "Standard" })
    );

  load();
}

// Show the diagram's model in JSON format that the user may edit
function save() {
  document.getElementById("mySavedModel").value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}
function load() {
  myDiagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
}
