/*
#################################################
SECTION 1: HELPER FUNCTIONS COMMON TO ALL PROJECTS
To-Dos: 1.
This set of functions are usually those that are applied to all projects.
#################################################
*/
  //CREATE CHARTING VARIABLES
//Creating the SVG using margin convention(source: http://bl.ocks.org/mbostock/3019563)
function createSVG(id, margin, padding) { //plotVar, margin, padding
  var outerWidth = d3.select(id).node().clientWidth,
      outerHeight = d3.select(id).node().clientHeight,
      innerWidth = outerWidth - margin.left - margin.right,
      innerHeight = outerHeight - margin.top -margin.bottom,
      width = innerWidth - padding.left - padding.right,
      height = innerHeight - padding.top - padding.bottom,
      plotVar = d3.select(id).append('svg')
          .attr('width', outerWidth)
          .attr('height', outerHeight)
          .append('g')
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      var xScale = d3.scaleOrdinal()
          .range([0, width]);
      var yScale = d3.scaleOrdinal()
          .range([height, 0]);
      var svgProps = {width: width, height: height, plotVar: plotVar, xScale: xScale, yScale: yScale}

  return svgProps
}

        //DATA MANIPULATION HELPERS
//Convert strings to numbers
function deString(d) {
    if (d === "") {
        return NaN;
    } else {
        return +d;
    }
}

//Create a unique array (use map)
var unique = function(xs) {
    var seen = {}
    return xs.filter(function(x) {
        if (seen[x])
            return
        seen[x] = true
        return x
    })
}

// Round to decimals
function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}
//wrap text
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

        //FUNCTIONS TO EXTEND D3 FUNCTIONALITY
// Extend D3 to move elements to the front/background
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
      this.parentNode.appendChild(this);
  });
};
d3.selection.prototype.moveToBack = function() {
  return this.each(function() {
      var firstChild = this.parentNode.firstChild;
      if (firstChild) {
          this.parentNode.insertBefore(this, firstChild);
      }
  });
};

/*
#################################################
SECTION 2: FUNCTIONS THAT APPLY TO THE CURRENT PROJECTS
To Dos: 1.

These functions are directly linked to the current project
#################################################
*/
        //FUNCTIONS TO EXTRACT AND MANAGE LABEL STATES
        //These functions extract the list of labels given the inner and outer label names. The next step initializes these labels to false. FOllowed by functions to update the state of these labels in the event of clicks. The setting and updation is only necessary for the outer labels. There are two states for each outer row -expanded or collapsed. Expanded applies when the sub labels for that row are displayed. This would require the outer label for that row(s) to be positioned on the outer div while the other row(s) are still positioned inside but collapsed to the bottom/top. While collapsed applies when all the sub labels are collapsed, in which case the labels are all positioned in the middle of each of the inner rows.

// This function takes the names of the inner and outer labels and creates a table
function getLabelList(data, mainLabelName, subLabelName){
  combos = unique(data.map(function(d) {
    var tempArray = [d[mainLabelName], d[subLabelName]]
    return tempArray.join(" | ");
  }));

  var finalTable = [];

  combos.forEach(function(d) {
    splitString = d.split(" | ")
    finalTable.push({
      mainLabel : splitString[0],
      subLabel : splitString[1]
    });
  });
  return finalTable.sort(function(a, b) {
    return (a.mainLabel > b.mainLabel) ? 1 : ((b.mainLabel > a.mainLabel) ? -1 : 0);
  })
}

//Funciton to initialize the state of the outer labels
function initializeMainLabelState(labels){
  var uniqueOuterRows = unique(labels.map(function(d){return d.mainLabel}));
  var data = [];
  uniqueOuterRows.forEach(function(d) {
    data.push({
      mainLabel: d,
      expand: false //initialize to false on expand
    })
  })
  return data;
}


//Function to update the state in reponse to click events.
function setMainLabelState(mainLabelState, mainLabel){
  mainLabelState.forEach(function(d){
    if(d.mainLabel === mainLabel){
      d.expand = !d.expand;
    }
  })
  return mainLabelState;
}

          //FUNCTION TO SPECIFY THE POSITIONIN OF LABEL.
          //We need separate functions for column and row labels, these functions take the current state of the labels and use them to position the labels on the canvas. The outer labels are positioned based on the available space and the number of sub labels that they have under them.

var unExpandedSize = 20;
//This function positions the outer row labels
function setMainRowLabePosition(mainLabelState, gridHeight, innerRowWidth, outerRowWidth, rowLabelTable){
  //the first task is to find the number of expanded labels
  var expandedRows = mainLabelState.filter(function(d) {return d.expand}).map(function(e) {return e.mainLabel}),
      nExpanded = mainLabelState.filter(function(d) {return d.expand}).length

  //Number of sub labels
  var nLabels = []
  mainLabelState.forEach(function(d) {
    if(d.expand){
      nLabels.push(rowLabelTable.filter(function(e) {return e.mainLabel === d.mainLabel}).length)
    } else {
      nLabels.push(0)
    }
  })
  //cumulative sum of labels
  var totLabels = nLabels.reduce(function(prev, d){ return prev + d}, 0)

  //next we set the total space available (since the expanded rows are still held on the inner column of labels)
  var unExpandedRowHeight = unExpandedSize;
  var yPos = 0;
  var incrementHeight = 0;

  var posData = []; //initialize the position data array
  if(nExpanded === 0){ //do the simple loop
    incrementHeight = gridHeight/mainLabelState.length; //common for all rows total space/rows
    mainLabelState.forEach(function(d, i){
      posData.push({
        name: d.mainLabel,
        x: innerRowWidth,
        y: yPos + incrementHeight/2,
        expand: d.expand,
        yStart: yPos,
        rowHeight: incrementHeight
      })
      yPos += incrementHeight
    })
  } else {//there is an expanded row
      mainLabelState.forEach(function(d, i){
        //set the available height based on the number of sub labels
        incrementHeight = (gridHeight - ((mainLabelState.length - nExpanded) * unExpandedRowHeight)) * (nLabels[i] / totLabels)

        if(!d.expand){ //and if the expand is false
          posData.push({
            name: d.mainLabel,
            x: innerRowWidth,
            y: yPos + unExpandedRowHeight, //place in the middle of the space for unexpanded row
            expand: d.expand,
            yStart: yPos,
            rowHeight: incrementHeight
          })
          yPos += unExpandedRowHeight //increment by the space for the unexpanded row
        } else { //if the row needs to be expanded
          posData.push({
            name: d.mainLabel,
            x: outerRowWidth,
            y: yPos + incrementHeight/2, //place in the middle of the space for expanded row
            expand: d.expand,
            yStart: yPos,
            rowHeight: incrementHeight
          })
          yPos += incrementHeight
        }
    })
  }
  return posData
}

//This function positions the inner row labels.
function setSubRowLabelPosition(mainRowLabelPosData, rowLabelTable, innerRowWidth){
  var expandedRows = mainRowLabelPosData.filter(function(d) {return d.expand})
  var xPos = innerRowWidth;
  //console.table(expandedRows)
  innerPosData = [];
  expandedRows.forEach(function(d) {
    //filter out the labels that re expanded
    var innerRowLabels = rowLabelTable.filter(function(e){ return e.mainLabel === d.name})

    //update the y position to start with for each row category
    var yPos = d.yStart

    var yIncrement = d.rowHeight/innerRowLabels.length;

    //loop through the inner labels
    innerRowLabels.forEach(function(f){
      innerPosData.push({
        subLabel: f.subLabel,
        mainLabel: d.name,
        x: xPos,
        y: yPos + yIncrement/2
      })
      //update the y position
      yPos += yIncrement;
    })
  })
      //console.table(innerPosData)
  return innerPosData;
}

//This funciton positions the inner column labels. This is a bit more complicated than the row labels since we need to rotate the labels whenever there is an expanded label.
function setMainColLabelPosition(mainColState, gridWidth, innerHeight, outerHeight, colLabelTable){
  //First we want to identfy the number of expanded columns
  var expandedCols = mainColState.filter(function(d) {return d.expand}).map(function(e) {return e.mainLabel}),
      nExpanded = mainColState.filter(function(d) {return d.expand}).length;

      //Number of sub labels
  var nLabels = [];
  mainColState.forEach(function(d) {
    if(d.expand){
      nLabels.push(colLabelTable.filter(function(e) {return e.mainLabel === d.mainLabel}).length)
    } else {
      nLabels.push(0)
    }
  });
  //cumulative sum of labels
  var totLabels = nLabels.reduce(function(prev, d){ return prev + d}, 0)
  //console.log(expandedCols, nLabels, totLabels)

  //intialize all the positioning variables
  var unExpandedColWidth = unExpandedSize;
  var xPos = 15;
  var yPos = innerHeight * 0.9;
  var incrementWidth = 0;
  var posData = []

  //the control structure for drawing the labels
  if(nExpanded === 0){ //The simple layout (nothings expanded draw the outer labels only)
    incrementWidth = gridWidth/mainColState.length; //common for all rows total space/rows
    mainColState.forEach(function(d, i){
      posData.push({
        name: d.mainLabel,
        x: xPos + incrementWidth/2, //center
        y: yPos, //position at 2/3
        expand: d.expand,
        xStart: xPos,
        colWidth: incrementWidth
      })
      xPos += incrementWidth
    })
  } else { //there is at least one expanded column
    mainColState.forEach(function(d, i){ //iterate through the labels
      //set the available width based on the number of sub labels
      incrementWidth = (gridWidth - ((mainColState.length - nExpanded) * unExpandedColWidth)) * (nLabels[i] / totLabels)
      if(!d.expand){ //and if the expand is false, swap x and y so that we can rotate the text
        posData.push({
          name: d.mainLabel,
          y: xPos + unExpandedColWidth/2,
          x: -yPos, //place in the middle of the space for unexpanded row
          expand: d.expand,
          xStart: xPos,
          colWidth: incrementWidth
        })

        xPos += unExpandedColWidth //increment by the space for the unexpanded row
      } else { //if the row needs to be expanded
        posData.push({
          name: d.mainLabel,
          x: xPos + incrementWidth/2,
          y: outerHeight * 0.6,
          expand: d.expand,
          xStart: xPos,
          colWidth: incrementWidth
        })
        xPos += incrementWidth
      }
    })
  }
  return posData
}

//Create the sub labels: The labels will need to be rotate to be displayed
function setSublabelColPosition(mainColPosData, colLabelTable, innerHeight){
  var expandedCols = mainColPosData.filter(function (d) { return d.expand; });

  var yPos = innerHeight * 0.9;
  var padding = 0;
  var subColPosData = [];

  expandedCols.forEach(function (d) {
    //filter out the column labels that are expandedCols
    var subColLabels = colLabelTable.filter(function(e) { return e.mainLabel === d.name; });

    //set the start postition for the label
    var xPos = d.xStart + padding;

    var xIncrement = (d.colWidth - (2 * padding))/subColLabels.length;

    //loop through the inner labels to set positions
    subColLabels.forEach(function(f) {
      subColPosData.push({
        subLabel: f.subLabel,
        mainLabel: d.name,
        y: xPos + xIncrement/2,
        x: -yPos
      })
      //update the positions
      xPos += xIncrement;

      //yPos -= innerHeight * 0.77

    });
  });
  return subColPosData

}
        // DATA PROCESSING FUNCTIONS FOR INITIAL LOAD
// Given a grid width, height, number of rows and columns generate a grid
function gridData(rowState, colState, gridWidth, gridHeight, rowLabels, colLabels, chartData) {

  //Extract the number of labels based on whether it is expanded or no
  var allRows = [];
  rowState.forEach(function(d) {
    if(!d.expand){//push the row as is if not expanded
      allRows.push({
        mainRowName: d.mainLabel,
        rowName: d.mainLabel,
        labelType: "main"
      })
    } else {//push all the sub labels
      var subRows = rowLabels.filter(function(e) { return e.mainLabel === d.mainLabel})
      subRows.forEach(function(e) {
        allRows.push({
          mainRowName: d.mainLabel,
          rowName: e.subLabel,
          labelType: "sub"
        })
      })
    }
  })

  var allCols = [];
  colState.forEach(function(d) {
    if(!d.expand){//push the row as is if not expanded
      allCols.push({
        mainColName: d.mainLabel,
        colName: d.mainLabel,
        labelType: "main"
      })
    } else {//push all the sub labels
      var subCols = colLabels.filter(function(e) { return e.mainLabel === d.mainLabel})
      subCols.forEach(function(e) {
        allCols.push({
          mainColName: d.mainLabel,
          colName: e.subLabel,
          labelType: "sub"
        })
      })
    }
  })

  var data = [];
  var xPos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
  var yPos = 1;
  var nExpandedRows = rowState.filter(function(d) {return d.expand}).map(function(e) {return e.mainLabel}).length
  var nExpandedCols = colState.filter(function(d) {return d.expand}).map(function(e) {return e.mainLabel}).length
  var nSubRows = allRows.filter(function(d) { return d.labelType === "sub"; }).length;
  var nsubCols = allCols.filter(function(d) { return d.labelType === "sub"; }).length;

  var availableHeight = (nExpandedRows === 0) ? gridHeight/rowState.length : (gridHeight - ((rowState.length - nExpandedRows) * unExpandedSize)) / nSubRows
  var availableWidth = (nExpandedCols === 0) ? gridWidth/colState.length : (gridWidth - ((colState.length - nExpandedCols) * unExpandedSize)) / nsubCols
  var height = 0;
  var width = 0;
  var fillData = 0;
  var interventionName;
  var jobName;

  allRows.forEach(function(d, i) {
    //data.push([]); //push an empty array to populate with columns

    //set the hieght of the row
    height = (nExpandedRows === 0) ? availableHeight : (d.labelType === "sub") ? availableHeight : unExpandedSize;

    allCols.forEach(function(e) {
      //set the width
      width = (nExpandedCols === 0) ? availableWidth : (e.labelType === "sub") ? availableWidth : unExpandedSize;

      //Fill data
      interventionName = (d.labelType === "main") ? "interventionType" : "intervention";
      jobName = (e.labelType === "main") ? "jobsType" : "jobsName";
      fillData = (height === unExpandedSize || width === unExpandedSize) ? 0 : chartData.filter(function(f) {return f[interventionName] === d.rowName && f[jobName] === e.colName; }).length;

      data.push({
        x: xPos,
        y: yPos,
        width: width,
        height: height,
        fill: fillData,
        mainRowName: d.mainRowName,
        mainColName: e.mainColName
      });

      //increment the width
      xPos += width;
    });

    //increment the height
    yPos += height;
    //reset x
    xPos = 1;
  });

  return data;
}

/*
#################################################
SECTION 2: LOAD THE DATA FILES AND PROCESS THEM
#################################################
*/
d3.queue()
    .defer(d3.csv, "data/projectData.csv")
    // .defer(d3.csv, "data/gdpPerCapData.csv", processallBrushData)
    .await(ready);

function ready(error, dataAll) {
    draw(dataAll);
}

function draw(dataAll) {

  /*
  #################################################
  SECTION 3: SETUP THE CANVAS

  The labels and the chart area are all svgs.
  #################################################
  */
  var outerColChars = createSVG('#outerClabels', margin = {top: 0, right: 15, bottom: 0, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0})
  var innerColChars = createSVG('#innerClabels', margin = {top: 0, right: 15, bottom: 0, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0})

  var outerRowChars = createSVG('#outerRlabels', margin = {top: 0, right: 5, bottom: 30, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0})
  var innerRowChars = createSVG('#innerRlabels', margin = {top: 0, right: 0, bottom: 30, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0})

  var legendChars = createSVG('#legend', margin = {top: 0, right: 15, bottom: 0, left: 5}, padding = {top: 0, right: 0, bottom: 0, left: 0})
  var heatmapChars = createSVG('#heatmap', margin = {top: 0, right: 15, bottom: 30, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0}),
      heatmapWidth = heatmapChars.width,
      heatmapHeight = heatmapChars.height,
      heatmapSVG = heatmapChars.plotVar,
      xHeatmapScale = heatmapChars.xScale,
      yHeatmapScale = heatmapChars.yScale;


  /*
  #################################################
  SECTION 3: SET THE STATE VARIABLES
  There are two levels of labels that we need to control. The first is the outer layer with the catergories. the second the inner layer of sub-categories. The first view of the visualization is aggregated at the outer layer. We would need to mainintain different 'state' variables for both these levels, to control their behaviour. This section creates these different state variables using predefined functions.
  #################################################
  */
          //GET THE LABEL LISTS
          //Before we set the states of the labels we need the list of labels for the rows and the columns
  //Get the keys of the outer and inner rows and columns
  var outerRowName = Object.keys(dataAll[0])[0],
      innerRowName = Object.keys(dataAll[0])[1],
      outerColName = Object.keys(dataAll[0])[2],
      innerColName = Object.keys(dataAll[0])[3]

  //Create the row label lookup table
  var rowLabelTable = getLabelList(dataAll, outerRowName, innerRowName);

  //Create the column label lookup table
  var colLabelTable = getLabelList(dataAll, outerColName, innerColName);;

          //SET THE INITIAL STATE OF THE OUTER LABELS

  var mainRowLabelState = initializeMainLabelState(rowLabelTable) //creates the state data
  var mainColLabelState = initializeMainLabelState(colLabelTable)

  // mainColLabelState = setMainLabelState(mainColLabelState, "Job Quality") //template for updating state
  //mainColLabelState = setMainLabelState(mainColLabelState, "Intermediate Outcomes")
  //mainRowLabelState = setMainLabelState(mainRowLabelState, "Macro-level: Economic Conditions")
  //console.table(mainColLabelState)


  drawRowLabels(mainRowLabelState, rowLabelTable)
  drawColLabels( mainColLabelState, colLabelTable)


  var gridPosition = gridData(mainRowLabelState, mainColLabelState, heatmapWidth, heatmapHeight,rowLabelTable, colLabelTable, dataAll)
  // gridData(rowState, colState, gridWidth, gridHeight, rowLabels, colLabels, chartData)

  drawGrid(gridPosition)




  /*
  #################################################
  SECTION 3: POSITIONING THE LABELS
  #################################################
  */
  function drawColLabels(mainColState, colLabelTable){
    var innerColSVG = innerColChars.plotVar,
        outerColSVG = outerColChars.plotVar,
        innerHeight = innerColChars.height,
        outerHeight = outerColChars.height
    var mainColPosData = setMainColLabelPosition(mainColLabelState, heatmapWidth, innerHeight, outerHeight,colLabelTable)

    //draw the grid extension lines
    innerColSVG.selectAll('.innerLines').remove()

    var data = []
    mainColPosData.forEach(function(d) {
      data.push(d.xStart + 1)
    })
    data.push(heatmapWidth + 14) //push the final line position

    var lineColExtended = innerColSVG.append('g').selectAll('.innerLines')
      .data(data)
      .enter().append('line')
      .attr('class', 'innerLines')
      .attr('y1', innerHeight)
      .attr('y2', innerHeight * 0.7)
      .attr('x1', function(d) {return d})
      .attr('x2', function(d) {return d})
      .style("stroke", "#D3D3D3")
      .style("stroke-width", "1px")

    //remove existing elements
    d3.selectAll(".mainColLabels").remove()

    if(mainColState.filter(function(d) {return d.expand}).length > 0){ //if expanded rotate

      var innerColLabels = innerColSVG.append('g').selectAll(".mainColLabels")
        .data(mainColPosData.filter(function(d) { return !d.expand; }))
        .enter().append("text")
        //.attr("text-anchor", "end")
        .attr('x', function(d) { return d.x; })
        .attr('y', function(d) { return d.y + 5; })
        .attr('dy', 0)
        .attr('class', 'mainColLabels')
        .text(function(d) {return d.name})
        .attr("transform", "rotate(-90)")
        //.call(wrap, 120)
        .on("click", onClickCols)
        .on("mouseover", mouseOverColName)
        .on("mouseout", mouseOutColName);

      var outerColLabels = outerColSVG.append('g').selectAll(".mainColLabels")
        .data(mainColPosData.filter(function(d) { return d.expand; }))
        .enter().append("text")
        .attr("text-anchor", "middle")
        .attr('x', function(d) {return d.x})
        .attr('y', function(d) {return d.y})
        .attr('dy', 0)
        .attr('class', 'mainColLabels')
        .text(function(d) {return d.name})
        //.call(wrap, 120)
        .on("click", onClickCols)
        .on("mouseover", mouseOverColName)
        .on("mouseout", mouseOutColName);

        //Draw the inner labels
      var innerLabelPositions = setSublabelColPosition(mainColPosData, colLabelTable, innerHeight)
      var innerColSubLabels = innerColSVG.append('g').selectAll(".subColLabels")
        .data(innerLabelPositions)
        .enter().append('text')
        .attr('x', function(d) {return d.x})
        .attr('y', function(d) {return d.y})
        .attr('dy', 0)
        .attr('class', 'subColLabels')
        .text(function(d) {return d.subLabel})
        .attr("transform", "rotate(-90)")
        .call(wrap, 120)

    } else {
      var innerColLabels = innerColSVG.append('g').selectAll(".mainColLabels")
        .data(mainColPosData)
        .enter().append("text")
        .attr("text-anchor", "middle")
        .attr('x', function(d) {return d.x})
        .attr('y', function(d) {return d.y})
        .attr('dy', 0)
        .attr('class', 'mainColLabels')
        .text(function(d) {return d.name})
        //.call(wrap, 120)
        .on("click", onClickCols)
        .on("mouseover", mouseOverColName)
        .on("mouseout", mouseOutColName);
    }

    function onClickCols(d){
      //remove existing elements
      d3.selectAll(".subColLabels").remove()

      //update the state
      mainColLabelState = setMainLabelState(mainColLabelState, d.name)
      //console.log(mainRowLabelState)
      //run the draw labels function
      drawColLabels( mainColState, colLabelTable)

      //update the grid
      gridPosition = gridData(mainRowLabelState, mainColLabelState, heatmapWidth, heatmapHeight, rowLabelTable, colLabelTable, dataAll)

      d3.selectAll('.grid').remove();
      drawGrid(gridPosition)

    }

    function mouseOverColName(d) {
      // console.log(d.name)
      d3.selectAll(".grid").filter(function(e) {return e.mainColName === d.name; })
        .transition()
        .duration(300)
        .attr("rx", function(e) { return e.width * 0.01; })
        .attr("ry", function(e) { return e.height * 0.01; })
        .style("stroke", "lightgrey")
        .style("stroke-width", "5px")
    }
    function mouseOutColName(d) {
      d3.selectAll(".grid").filter(function(e) { return e.mainColName === d.name; })
        .transition()
        .duration(30)
        .attr("rx", function(e) { return e.width * 0.05; })
        .attr("ry", function(e) { return e.height * 0.05; })
        .style("stroke", "white")
        .style("stroke-width", "1px")
    }


  }
  function drawRowLabels(mainRowLabelState, rowLabelTable){
    //console.table(mainRowLabelState)
    //remove existing elements
    d3.selectAll(".mainRowLabels").remove()

    var innerRowSVG = innerRowChars.plotVar,
        innerRowWidth = innerRowChars.width,
        outerRowSVG = outerRowChars.plotVar,
        outerRowWidth = outerRowChars.width

    var rowPosData = setMainRowLabePosition(mainRowLabelState, heatmapHeight, innerRowWidth, outerRowWidth, rowLabelTable) //sets the position using width argument that relies on the div that it is being attached to.

    //draw the grid extension lines
    innerRowSVG.selectAll('.innerLines').remove()

    var data = []
    rowPosData.forEach(function(d) {
      data.push(d.yStart + 1)
    })
    data.push(heatmapHeight + 1) //push the final line position

    var lineRowExtended = innerRowSVG.append('g').selectAll('.innerLines')
      .data(data)
      .enter().append('line')
      .attr('class', 'innerLines')
      .attr('x1', innerRowWidth)
      .attr('x2', innerRowWidth * 0.2)
      .attr('y1', function(d) {return d})
      .attr('y2', function(d) {return d})
      .style("stroke", "#D3D3D3")
      .style("stroke-width", "1px")

    //draw the inner column labels
    var innerRowLabels = innerRowSVG.append('g').selectAll(".mainRowLabels")
      .data(rowPosData.filter(function(d) {return !d.expand}))
      .enter().append("text")
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr('x', function(d){ return d.x})
      .attr('y', function(d) {return d.y - 5})
      .attr('dy', 0)
      .attr("class", "mainRowLabels")
      .text(function(d) {return d.name})
      .call(wrap, innerRowWidth * 0.95)
      .on("click", onClickRows)
      .on("mouseover", mouseOverRowName)
      .on("mouseout", mouseOutRowName)

      var outerRowLabels = outerRowSVG.append('g').selectAll(".mainRowLabels")
        .data(rowPosData.filter(function(d) {return d.expand}))
        .enter().append("text")
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr('x', function(d){ return d.x})
        .attr('y', function(d) {return d.y})
        .attr('dy', 0)
        .attr("class", "mainRowLabels")
        .text(function(d) {return d.name})
        .call(wrap, outerRowWidth * 0.95)
        .on("click", onClickRows)
        .on("mouseover", mouseOverRowName)
        .on("mouseout", mouseOutRowName)


      //Draw the inner labels
      var innerLabelPositions = setSubRowLabelPosition(rowPosData, rowLabelTable, innerRowWidth)

      var innerRowSubLabel = innerRowSVG.append('g').selectAll('.subRowLabels')
        .data(innerLabelPositions)
        .enter().append("text")
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr('x', function(d){ return d.x})
        .attr('y', function(d) {return d.y})
        .attr('dy', 0)
        .attr("class", "subRowLabels")
        .text(function(d) {return d.subLabel})
        //.call(wrap, innerRowWidth)

      function onClickRows(d){
        //remove existing elements
        d3.selectAll(".subRowLabels").remove()

        var clickedName = d.name
        //update the state
        mainRowLabelState = setMainLabelState(mainRowLabelState, clickedName)
        //console.log(mainRowLabelState)
        //run the draw labels function
        //innerRowSVG.transition().duration(500)
        drawRowLabels(mainRowLabelState, rowLabelTable)

        //update the grid
        gridPosition = gridData(mainRowLabelState, mainColLabelState, heatmapWidth, heatmapHeight, rowLabelTable, colLabelTable, dataAll)

        d3.selectAll('.grid').remove();
        drawGrid(gridPosition)

      }

      function mouseOverRowName(d) {
        // console.log(d.name)
        d3.selectAll(".grid").filter(function(e) {return e.mainRowName === d.name; })
          .transition()
          .duration(300)
          .attr("rx", function(e) { return e.width * 0.01; })
          .attr("ry", function(e) { return e.height * 0.01; })
          .style("stroke", "lightgrey")
          .style("stroke-width", "5px")
      }
      function mouseOutRowName(d) {
        d3.selectAll(".grid").filter(function(e) { return e.mainRowName === d.name; })
          .transition()
          .duration(30)
          .attr("rx", function(e) { return e.width * 0.05; })
          .attr("ry", function(e) { return e.height * 0.05; })
          .style("stroke", "white")
          .style("stroke-width", "1px")
      }



  }

  /*
  #################################################
  SECTION 3: CREATE THE HEATMAP STRUCTURE
  #################################################
  */
  function drawGrid(gridPosition){
    // console.table(gridPosition)
    var grid = heatmapSVG.append('g').selectAll('.grid')
      .data(gridPosition)
      .enter().append("rect")
      .attr("class", "grid")
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("rx", function(d) { return d.width * 0.05; })
      .attr("ry", function(d) { return d.height * 0.05; })
      .attr("width", function(d) { return d.width; })
      .attr("height", function(d) { return d.height; })
      .style('stroke-width', "1px")
      .style("stroke", "white")
      .on("mouseover", mouseOverGrid)
      .on("mouseout", mouseOutGrid);

    var colorScale = d3.scaleSequential(d3.interpolatePlasma)
      .domain(d3.extent(gridPosition, function(d) {return d.fill; }).reverse());

    d3.selectAll('.grid')
      .attr('fill', function(d) {return ((d.fill === 0) ? "#b4b4b4" : colorScale(d.fill)); })

      //drawing the legend
    var legendPadding = 20;
    var legendSVG = legendChars.plotVar;
    var legendWidth = legendChars.width;
    var legendHeight = legendChars.height/3;
    var legendScale = d3.scaleLinear()
      .domain(d3.extent(gridPosition, function(d) {return d.fill; }))
      .range([0, legendWidth])

    //remove all things attached to the legend svg
    legendSVG.selectAll("*").remove()

    var legendData = d3.range(d3.max(gridPosition, function(d) {return d.fill; }))
    var barWidth = legendWidth/legendData.length;
    // console.log(legendData)
    //draw legend
    var legend = legendSVG.append('g').selectAll(".legendBars")
      .data(legendData)
      .enter().append("rect")
      .attr("class", "legendBars")
      .attr("x", function(d){return legendScale(d)})
      .attr("y", legendPadding)
      .attr("height", legendHeight)
      .attr("width", barWidth)
      .style("fill", function(d) { return colorScale(d) })
      .style("stroke", function(d) { return colorScale(d) })

    //create a legend axis
    var legendAxis = legendSVG.append('g')
      .attr('class', '.legendAxis')
      .attr("transform", "translate(0," + (legendHeight + legendPadding) + ")")
      .call(d3.axisBottom(legendScale)
        .ticks(4)
        .tickSize(-legendHeight))
      .attr("text-anchor", null)
      .selectAll("text")
      .attr("x", -10)

    var markerText = legendSVG.append('text')
      .attr("class", "markerText")
      .attr("x", 0)
      .attr("y", legendPadding-5)
      .text("")
      .attr("text-anchor", "middle")
      .attr("fill", "darkgreen")


    function mouseOverGrid(d){
      d3.selectAll(".legendBars").filter(function(e) { return e === d.fill })
        .transition()
        .duration(200)
        .style("fill", "darkgrey")
        .style("stroke", "darkgrey")

      d3.select(".markerText")
        .transition()
        .duration(200)
        .attr("x", legendScale(d.fill) + barWidth/2)
        .text(d.fill)
    }
    function mouseOutGrid(d){

      d3.selectAll(".legendBars").filter(function(e) { return e === d.fill })
        .transition()
        .duration(20)
        .style("fill", function(e) { return colorScale(e); })
        .style("stroke", function(e) { return colorScale(e); })

        d3.select(".markerText")
          .transition()
          .duration(20)
          .text("")

    }
  }






  }
