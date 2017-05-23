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

function generateDropDown(indicatorId, listName, defaultName, data, projectLimit) {
	//generate the unique list of values.
  var listVals = unique(data.map(function(d) { return d[listName]; })).sort()


  //for each item in the list if the n projects is greater than the project limit then push
  var listData = [{id: defaultName, text: defaultName}];
  listVals.forEach(function(d) {

    var nProjects = unique(data.filter(function(e) { return e[listName] === d; }).map(function (f) { return f.projId; })).length;
    // console.log(nProjects)
    if(nProjects >= projectLimit){
      listData.push({
        id: d,
        text: d
      })
    }
  })
  $(indicatorId).select2({
    data: listData
  })
}


        //FUNCTIONS TO EXTRACT AND MANAGE LABEL STATES
        //These functions extract the list of labels given the inner and outer label names. The next step initializes these labels to false. FOllowed by functions to update the state of these labels in the event of clicks. The setting and updation is only necessary for the outer labels. There are two states for each outer row -expanded or collapsed. Expanded applies when the sub labels for that row are displayed. This would require the outer label for that row(s) to be positioned on the outer div while the other row(s) are still positioned inside but collapsed to the bottom/top. While collapsed applies when all the sub labels are collapsed, in which case the labels are all positioned in the middle of each of the inner rows.

// This function takes the names of the inner and outer labels and creates a table
// function getLabelList(labelData, mainLabelName, subLabelName){
//   combos = unique(labelData.map(function(d) {
//     var tempArray = [d[mainLabelName], d[subLabelName]]
//     return tempArray.join(" | ");
//   }));
//
//   var finalTable = [];
//
//   combos.forEach(function(d) {
//     splitString = d.split(" | ")
//     finalTable.push({
//       mainLabel : splitString[0],
//       subLabel : splitString[1]
//     });
//   });
//   return finalTable.sort(function(a, b) {
//     return (a.mainLabel > b.mainLabel) ? 1 : ((b.mainLabel > a.mainLabel) ? -1 : 0);
//   })
// }

//Funciton to initialize the state of the outer labels
function initializeMainLabelState(labels){
  var mainLabels = unique(labels.map(function(d){return d.mainLabel}));
  var data = [];
  mainLabels.forEach(function(d) {
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
function setMainRowLabePosition(mainLabelState, gridHeight, innerRowWidth, outerRowWidth, rowLabelTable, colLabelHeight){
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
  var totLabels = nLabels.reduce(function(prev, d){ return prev + d; }, 0)

  //next we set the total space available (since the expanded rows are still held on the inner column of labels)
  var unExpandedRowHeight = unExpandedSize;
  var yPos = colLabelHeight + 1;
  var xPos = (innerRowWidth + outerRowWidth) * 0.95
  var incrementHeight = 0;

  var posData = []; //initialize the position data array
  if(nExpanded === 0){ //do the simple loop
    incrementHeight = gridHeight/mainLabelState.length; //common for all rows total space/rows
    mainLabelState.forEach(function(d, i){
      posData.push({
        name: d.mainLabel,
        x: xPos,
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
            x: xPos,
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
function setSubRowLabelPosition(mainRowLabelPosData, rowLabelTable, innerRowPosition){
  var expandedRows = mainRowLabelPosData.filter(function(d) {return d.expand})
  var xPos = innerRowPosition;
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
function setMainColLabelPosition(mainColState, gridWidth, innerHeight, outerHeight, colLabelTable, rowLabelWidth){
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
  var xPos = rowLabelWidth;
  var yPos = (outerHeight + innerHeight) * 0.9;
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
          y: outerHeight,
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
var rotateLimit = 90;
function setSublabelColPosition(mainColPosData, colLabelTable, innerLabelPos){
  //get the expanded columns
  var expandedCols = mainColPosData.filter(function (d) { return d.expand; });

  var yPos = innerLabelPos * 0.9;
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
        x: xIncrement < rotateLimit ? -yPos : xPos + xIncrement/2,
        y: xIncrement < rotateLimit ?  xPos + xIncrement/2 - f.subLabel.length * 0.4 :  yPos - f.subLabel.length * 1.25,
        rotate: xIncrement < rotateLimit,
        xIncrement: xIncrement
      })
      //update the positions
      xPos += xIncrement;

    });
  });
  // console.table(subColPosData)
  return subColPosData
}
        // DATA PROCESSING FUNCTIONS FOR INITIAL LOAD
// Given a grid width, height, number of rows and columns generate a grid
function gridData(rowState, colState, gridWidth, gridHeight, rowLabels, colLabels, chartData, rowLabelWidth, colLabelHeight) {

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
  var xPos = rowLabelWidth + 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
  var yPos = colLabelHeight + 1;
  var nExpandedRows = rowState.filter(function(d) {return d.expand}).map(function(e) {return e.mainLabel}).length
  var nExpandedCols = colState.filter(function(d) {return d.expand}).map(function(e) {return e.mainLabel}).length
  var nSubRows = allRows.filter(function(d) { return d.labelType === "sub"; }).length;
  var nsubCols = allCols.filter(function(d) { return d.labelType === "sub"; }).length;

  var availableHeight = (nExpandedRows === 0) ? gridHeight/rowState.length : (gridHeight - ((rowState.length - nExpandedRows) * unExpandedSize)) / nSubRows
  var availableWidth = (nExpandedCols === 0) ? gridWidth/colState.length : (gridWidth - ((colState.length - nExpandedCols) * unExpandedSize)) / nsubCols
  var height = 0;
  var width = 0;
  var fillData = 0;
  var rowName;
  var colName;

  allRows.forEach(function(d, i) {
    //data.push([]); //push an empty array to populate with columns

    //set the hieght of the row
    height = (nExpandedRows === 0) ? availableHeight : (d.labelType === "sub") ? availableHeight : unExpandedSize;

    allCols.forEach(function(e) {
      //set the width
      width = (nExpandedCols === 0) ? availableWidth : (e.labelType === "sub") ? availableWidth : unExpandedSize;

      //Fill data
      rowName = (d.labelType === "main") ? "mainRowLabel" : "subRowLabel";//identify the row variable name
      colName = (e.labelType === "main") ? "mainColLabel" : "subColLabel";
      fillData = (height === unExpandedSize || width === unExpandedSize) ? 0 : chartData.filter(function(f) {return f[rowName] === d.rowName && f[colName] === e.colName; }).length;

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
    xPos = rowLabelWidth;
  });

  return data;
}

/*
#################################################
SECTION 2: LOAD THE DATA FILES AND PROCESS THEM
#################################################
*/
d3.queue()
    .defer(d3.csv, "data/appData.csv")
    .defer(d3.csv, "data/rowLabels.csv")
    .defer(d3.csv, "data/colLabels.csv")
    // .defer(d3.csv, "data/gdpPerCapData.csv", processallBrushData)
    .await(ready);

function ready(error, dataAll, rowLabelData, colLabelData) {
    draw(dataAll, rowLabelData, colLabelData);
}

function draw(dataAll, rowLabelData, colLabelData) {
  // console.log(rowLabelData)
  //geerate all the dropdown lists
  generateDropDown("#countryList", "projCountry", "World", dataAll, 15)
  generateDropDown("#regionList", "projRegion", "World", dataAll, 15)
  generateDropDown("#gpList", "gP", "All GPs", dataAll, 15)


  /*
  #################################################
  SECTION 3: SETUP THE CANVAS

  The labels and the chart area are all svgs.
  #################################################
  */

  // var legendChars = createSVG('#legend', margin = {top: 0, right: 15, bottom: 0, left: 5}, padding = {top: 0, right: 0, bottom: 0, left: 0})
  var heatmapChars = createSVG('#heatmap', margin = {top: 0, right: 0, bottom: 0, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0}),
      heatmapWidth = heatmapChars.width,
      heatmapHeight = heatmapChars.height,
      heatmapSVG = heatmapChars.plotVar.attr("id", "heatmapSVG"),
      xHeatmapScale = heatmapChars.xScale,
      yHeatmapScale = heatmapChars.yScale;

  var legendSVG = heatmapSVG.append('g')

  var innerRowWidth = 220,
      outerRowWidth = 100,
      rowLabelWidth = innerRowWidth + outerRowWidth,
      innerColHeight = 100,
      outerColHeight = 20,
      colLabelHeight = innerColHeight + outerColHeight;

  var gridHeight = heatmapHeight - colLabelHeight,
      gridWidth = heatmapWidth - rowLabelWidth;

  // console.log(gridWidth, heatmapHeight)


  /*
  #################################################
  SECTION 3: SET THE STATE VARIABLES
  There are two levels of labels that we need to control. The first is the outer layer with the catergories. the second the inner layer of sub-categories. The first view of the visualization is aggregated at the outer layer. We would need to mainintain different 'state' variables for both these levels, to control their behaviour. This section creates these different state variables using predefined functions.
  #################################################
  */

          //SET THE INITIAL STATE OF THE OUTER LABELS

  var mainRowLabelState = initializeMainLabelState(rowLabelData) //creates the state data
  var mainColLabelState = initializeMainLabelState(colLabelData)

  var gridPosition = gridData(mainRowLabelState, mainColLabelState, gridWidth, gridHeight, rowLabelData, colLabelData, dataAll, rowLabelWidth, colLabelHeight)

  //draw all the elements

  drawColLabels(mainColLabelState, dataAll)
  drawRowLabels(mainRowLabelState, dataAll)
  drawGrid(gridPosition)




  /*
  #################################################
  SECTION 3: POSITIONING THE LABELS
  #################################################
  */
  function drawColLabels(mainColState, currChartData){
    //set the label positions based on current state of the column labels
    var mainColPosData = setMainColLabelPosition(mainColState, gridWidth, innerColHeight, outerColHeight, colLabelData, rowLabelWidth)

    //draw the grid extension lines

    //remove existing elements
    heatmapSVG.selectAll(".subColLabels").remove()

    var colLineData = []
    mainColPosData.forEach(function(d) {
      colLineData.push(d.xStart + 1)
    })
    colLineData.push(heatmapWidth - 1) //push the final line position

    var lineColExtended = heatmapSVG.append('g').selectAll('.innerColLines')
      .data(colLineData)
      .enter().append('line')
      .attr('class', 'innerColLines')
      .attr('y1', colLabelHeight)
      .attr('y2', colLabelHeight * 0.7)
      .attr('x1', function(d) {return d})
      .attr('x2', function(d) {return d})
      .style("stroke", "#D3D3D3")
      .style("stroke-width", "1px")

    //remove existing elements
    d3.selectAll(".mainColLabels").remove()

    if(mainColState.filter(function(d) {return d.expand}).length > 0){ //if expanded rotate

      var innerColLabels = heatmapSVG.append('g').selectAll(".mainColLabels")
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

      var outerColLabels = heatmapSVG.append('g').selectAll(".mainColLabels")
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
      var innerLabelPositions = setSublabelColPosition(mainColPosData, colLabelData, colLabelHeight)

      var innerColSubLabels = heatmapSVG.append('g').selectAll(".subColLabels")
        .data(innerLabelPositions)
        .enter().append('text')
        .attr('x', function(d) {return d.x; })
        .attr('y', function(d) {return d.y;})
        .attr('dy', 0)
        .attr("text-anchor", function(d) { return d.rotate ? "start" : "middle"})
        .attr('class', 'subColLabels')
        .text(function(d) {return d.subLabel})
        .attr("transform", function(d) {return d.rotate ? "rotate(-90)" : "rotate(0)"; })
        .call(wrap, 85)
      //   function (d) { if(d.rotate) {
      //     console.log(innerColHeight)
      //     return innerColHeight * 0.6
      //   } else {
      //     console.log(d.xIncrement)
      //     return d.xIncrement * 0.6
      //   }
      // }
    } else {
      var innerColLabels = heatmapSVG.append('g').selectAll(".mainColLabels")
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
      heatmapSVG.selectAll('.innerColLines').remove()

      //update the state based on the click
      mainColLabelState = setMainLabelState(mainColLabelState, d.name)

      //run the draw labels function
      drawColLabels(mainColState, currChartData)


      //update the grid
      gridPosition = gridData(mainRowLabelState, mainColLabelState, gridWidth, gridHeight, rowLabelData, colLabelData, currChartData, rowLabelWidth, colLabelHeight)

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
  function drawRowLabels(mainRowLabelState, currChartData){
    //console.table(mainRowLabelState)
    //remove existing elements
    heatmapSVG.selectAll(".mainRowLabels").remove()
    heatmapSVG.selectAll(".subRowLabels").remove()


    var rowPosData = setMainRowLabePosition(mainRowLabelState, gridHeight, innerRowWidth, outerRowWidth, rowLabelData, colLabelHeight) //sets the position using width argument that relies on the div that it is being attached to.
    // console.table(rowPosData)

    //draw the grid extension lines
    heatmapSVG.selectAll('.innerRowLines').remove()

    var rowLineData = []
    rowPosData.forEach(function(d) {
      rowLineData.push(d.yStart + 1)
    })
    rowLineData.push(heatmapHeight + 1) //push the final line position

    var lineRowExtended = heatmapSVG.append('g').selectAll('.innerRowLines')
      .data(rowLineData)
      .enter().append('line')
      .attr('class', 'innerRowLines')
      .attr('x1', rowLabelWidth)
      .attr('x2', rowLabelWidth * 0.6)
      .attr('y1', function(d) {return d})
      .attr('y2', function(d) {return d})
      .style("stroke", "#D3D3D3")
      .style("stroke-width", "1px")

    //draw the inner labels
    var innerRowLabels = heatmapSVG.append('g').selectAll(".mainRowLabels")
      .data(rowPosData.filter(function(d) {return !d.expand}))
      .enter().append("text")
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr('x', function(d){ return d.x})
      .attr('y', function(d) {return d.y - 5})
      .attr('dy', 0)
      .attr("class", "mainRowLabels")
      .text(function(d) {return d.name})
      .call(wrap, innerRowWidth * 0.9)
      .on("click", onClickRows)
      .on("mouseover", mouseOverRowName)
      .on("mouseout", mouseOutRowName)

      var outerRowLabels = heatmapSVG.append('g').selectAll(".mainRowLabels")
        .data(rowPosData.filter(function(d) {return d.expand}))
        .enter().append("text")
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr('x', function(d){ return d.x})
        .attr('y', function(d) {return d.y})
        .attr('dy', 0)
        .attr("class", "mainRowLabels")
        .text(function(d) {return d.name})
        .call(wrap, outerRowWidth * 0.8)
        .on("click", onClickRows)
        .on("mouseover", mouseOverRowName)
        .on("mouseout", mouseOutRowName)


      //Draw the inner labels
      var innerSubLabelPositions = setSubRowLabelPosition(rowPosData, rowLabelData, rowLabelWidth)

      var innerRowSubLabel = heatmapSVG.append('g').selectAll('.subRowLabels')
        .data(innerSubLabelPositions)
        .enter().append("text")
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .attr('x', function(d){ return d.x})
        .attr('y', function(d) {return d.y})
        .attr('dy', 0)
        .attr("class", "subRowLabels")
        .text(function(d) {return d.subLabel})
        .call(wrap, innerRowWidth * 0.9)

      function onClickRows(d){

        var clickedName = d.name;
        //update the state
        mainRowLabelState = setMainLabelState(mainRowLabelState, clickedName)

        //run the draw labels function
        drawRowLabels(mainRowLabelState, currChartData)

        //update the grid
        gridPosition = gridData(mainRowLabelState, mainColLabelState, gridWidth, gridHeight, rowLabelData, colLabelData, currChartData, rowLabelWidth, colLabelHeight)

        d3.selectAll('.grid').remove(); //remove grid before redrawing
        legendSVG.selectAll("*").remove()

        drawGrid(gridPosition)

      }

      function mouseOverRowName(d) {
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
    //draw the grid
    var grid = heatmapSVG.attr("id", "heatmapSVG").append('g').selectAll('.grid')
      .data(gridPosition)
      .enter().append("rect")
      .attr("class", "grid")
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; })
      .attr("rx", function(d) { return d.width * 0.05; })
      .attr("ry", function(d) { return d.height * 0.05; })
      .attr("width", function(d) { return d.width; })
      .attr("height", function(d) { return d.height; })
      .style('stroke-width', "2px")
      .style("stroke", "white")
      .on("mouseover", mouseOverGrid)
      .on("mouseout", mouseOutGrid);

    //set the color scale mapped to the count of projects
    var colorScale = d3.scaleSequential(d3.interpolatePlasma)
      .domain(d3.extent(gridPosition, function(d) { return d.fill; }).reverse());

    //if the fill value is zero
    d3.selectAll('.grid')
      .attr('fill', function(d) {return ((d.fill === 0) ? "#b4b4b4" : colorScale(d.fill)); })

      //drawing the legend
    var legendXPos = outerRowWidth;
    var legendYPos = colLabelHeight * 0.5;
    var legendWidth = rowLabelWidth * 0.6;
    var legendHeight = colLabelHeight/3;

    //remove all things attached to the legend svg
    heatmapSVG.selectAll(".legendBars").remove()
    heatmapSVG.selectAll(".legendAxis").remove()
    heatmapSVG.selectAll(".markerText").remove()
    heatmapSVG.selectAll(".markerBar").remove()


    //axis scale determines the positioning of the text and the marker bars and the axis
    var axisScale = d3.scaleLinear()
      .domain(d3.extent(gridPosition, function(d) {return d.fill; }))
      .range([0, legendWidth])

    //the legend scale fits the colors to the legend
    var legendScale = d3.scaleSequential(d3.interpolateInferno)
      .domain([legendWidth, 0])

    var legend = heatmapSVG.append('g').selectAll(".legendBars")
      .data(d3.range(legendWidth))
      .enter().append("rect")
      .attr("class", "legendBars")
      .attr("x", function(d, i) { return i + legendXPos; })
      .attr("y", legendYPos)
      .attr("height", legendHeight)
      .attr("width", 1)
      .attr("fill", function(d) { return legendScale(d) })
      // .style("stroke", function(d) { return legendScale(d) })

    //create a legend axis
    var legendAxis = heatmapSVG.append('g')
      .attr('class', 'legendAxis')
      .attr("transform", "translate("+ legendXPos + "," + (legendHeight + legendYPos) + ")")
      .call(d3.axisBottom(axisScale)
        .ticks(4)
        .tickSize(-legendHeight))
      .attr("text-anchor", null)
      .selectAll("text")
      .attr("x", -5)

    var markerText = heatmapSVG.append('text')
      .attr("class", "markerText")
      .attr("x", legendXPos)
      .attr("y", legendYPos - 5)
      .text("")
      .attr("text-anchor", "middle")
      .attr("fill", "darkgreen")

    var markerBar = heatmapSVG.append('rect')
      .attr("class", "markerBar")
      .attr("x", legendXPos)
      .attr("y", legendYPos)
      .attr("height", legendHeight)
      .attr("width", 2)
      .attr("fill", "green")
      .attr("fill-opacity", 0)

    function mouseOverGrid(d){
      d3.selectAll(".markerBar")
        .transition()
        .duration(200)
        .attr("x", legendXPos + axisScale(d.fill))
        .attr("fill-opacity", 1)

      d3.select(".markerText")
        .transition()
        .duration(200)
        .attr("x", axisScale(d.fill) + 1.5 + legendXPos )
        .text(d.fill)
    }

    function mouseOutGrid(d){
      d3.selectAll(".markerBar")
        .transition()
        .duration(20)
        .attr("fill-opacity", 0)

        d3.select(".markerText")
          .transition()
          .duration(20)
          .text("")

    }
  }


  /*
  #################################################
  SECTION 3: CREATE CONTROL EVENT LISTERNER
  #################################################
  */
  var country = "World";
  var region = "World";
  var gP = "All GPs";
  var tempData = dataAll;

  function onChangeFunction(){

    if(country !="World"){
      tempData = tempData.filter(function(d) { return d.projCountry === country; })
    }
    if(region != "World"){
      tempData = tempData.filter(function(d) { return d.projRegion === region; })
    }
    if(gP != "All GPs"){
      tempData = tempData.filter(function(d) { return d.gP === gP; })
    }

    //SET THE INITIAL STATE OF THE OUTER LABELS
    mainRowLabelState = initializeMainLabelState(rowLabelData) //creates the state data
    mainColLabelState = initializeMainLabelState(colLabelData)

    gridPosition = gridData(mainRowLabelState, mainColLabelState, gridWidth, gridHeight, rowLabelData, colLabelData, tempData, rowLabelWidth, colLabelHeight)

    //draw all the elements
    drawRowLabels(mainRowLabelState, tempData)
    drawColLabels( mainColLabelState, tempData)
    drawGrid(gridPosition)
  }

  $("#countryList").on('change', function(d) {
    //set the country variable
    country = this.value;

    //execute the change function
    onChangeFunction()
  })

  $("#regionList").on('change', function(d) {
    //set the region variable
    region = this.value;

    //execute the change function
    onChangeFunction()
  })

  $("#gpList").on('change', function(d) {
    //set the gP variable
    gP = this.value;

    //execute the change function
    onChangeFunction()
  })

  /*
  #################################################
  SECTION 3: THE DOWNLOAD IMAGE AND DATA BUTTONS
  #################################################
  */

  d3.select("#saveChartButton").on("click", function(){
    // console.log(document.getElementById("heatmapSVG"))
    saveSvgAsPng(document.getElementById("heatmapSVG"), "heatmap.png")
    // saveSvgAsPng(document.getElementById("legend"), "legend.png")
  });

  window.exportData = function exportData() {
      alasql("SELECT * INTO CSV('jobsPortfolioData.csv') FROM ?",[tempData]);
  }

}
