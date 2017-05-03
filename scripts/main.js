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
        //FUNCTIONS TO EXTRACT THE INNER AND OUTER ROW AND COLUMN LABELS
        //These functions create a lookup table with the inner and outer layer of labels based on the data
// This function creates the lookup table of row labels
function getRowlist(data, outerRow, innerRow){
  combos = unique(data.map(function(d) {
    var tempArray = [d[outerRow], d[innerRow]]
    return tempArray.join(" | ");
  }));

  var finalTable = [];

  combos.forEach(function(d) {
    splitString = d.split(" | ")
    finalTable.push({
      outerRowLabel : splitString[0],
      innerRowLabel : splitString[1]
    });
  });
  return finalTable.sort(function(a, b) {
    return (a.outerRowLabel > b.outerRowLabel) ? 1 : ((b.outerRowLabel > a.outerRowLabel) ? -1 : 0);
  })
}

// This function creates the lookup table of column labels
function getCollist(data, outerCol, innerCol){
  combos = unique(data.map(function(d) {
    var tempArray = [d[outerCol], d[innerCol]]
    return tempArray.join(" | ");
  }));

  var finalTable = [];

  combos.forEach(function(d) {
    splitString = d.split(" | ")
    finalTable.push({
      outerColLabel : splitString[0],
      innerColLabel : splitString[1]
    });
  });
  return finalTable.sort(function(a, b) {
    return (a.outerColLabel > b.outerColLabel) ? 1 : ((b.outerColLabel > a.outerColLabel) ? -1 : 0);
  })
}

        //FUNCTIONS TO SET AND UPDATE ROW COLUMN LABEL STATE
        //These functions manage the appearance and positioning of the outer and inner layers of labels. Each label requires an x and y position value that can be used to position it on the appropriate canvas.
        //Outer rows: There are two states for each outer row -expanded or collapsed. Expanded applies when the sub labels for that row are displayed. This would require the outer label for that row(s) to be positioned on the outer div while the other row(s) are still positioned inside but collapsed to the bottom/top. While collapsed applies when all the sub labels are collapsed, in which case the labels are all positioned in the middle of each of the inner rows.

//The first step is to create a unique list of outer rows and initialize its state.
function initializeOuterRowState(rowLookupTable){
  var uniqueOuterRows = unique(rowLookupTable.map(function(d){return d.outerRowLabel}));
  var data = [];
  uniqueOuterRows.forEach(function(d) {
    data.push({
      outerRowLabel: d,
      expand: false //initialize to false on expand
    })
  })
  return data;
}

//Next we create a function that updates the state based on a row name
function setOuterRowState(outerRowState, outerRowLabel){
  outerRowState.forEach(function(d){
    if(d.outerRowLabel === outerRowLabel){
      d.expand = !d.expand;
    }
  })
  return outerRowState;
}

//Next we create the data that would determine the position of the row labels. The labels, irrespective of whether they are positioned on the outer or the inner div would have the same y position since, which is determined by how the other rows are either expanded or not.
function setOuterRowPosition(outerRowState, gridHeight, rowWidth){
  var posData = [];
  var xPos = rowWidth; //left margin
  var rowHeight = gridHeight/outerRowState.length
  var yPos = rowHeight/2

  outerRowState.forEach(function(d, i){
    posData.push({
      name: d.outerRowLabel,
      x: xPos,
      y: yPos
    })
    yPos += rowHeight
  })
  return posData
}


        // DATA PROCESSING FUNCTIONS FOR INITIAL LOAD
// Given a grid width, height, number of rows and columns generate a grid
function gridData(rows, columns, gridWidth, gridHeight) {
  var data = [];
  var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
  var ypos = 1;
  var width = (gridWidth - xpos)/columns;
  var height = (gridHeight - ypos)/rows;

  // iterate for rows
  for (var row = 0; row < rows; row++) {
      data.push([]); //for each row push an empty array which is then subsequently filled by the columns

      // iterate for cells/columns inside rows
      for (var column = 0; column < columns; column++) {
          data[row].push({
              x: xpos,
              y: ypos,
              width: width,
              height: height
          })
          // increment the x position. I.e. move it over by width variable
          xpos += width;
      }
      // reset the x position after a row is complete
      xpos = 1;
      // increment the y position for the next row. Move it down height variable
      ypos += height;
  }
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
  var outerColChars = createSVG('#outerClabels', margin = {top: 0, right: 15, bottom: 0, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0}),
      outerColWidth = outerColChars.width,
      outerColHeight = outerColChars.height,
      outerColSVG = outerColChars.plotVar,
      xOuterColScale = outerColChars.xScale,
      yOuterColScale = outerColChars.yScale;
  var innerColChars = createSVG('#innerClabels', margin = {top: 0, right: 15, bottom: 0, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0}),
      innerColWidth = innerColChars.width,
      innerColHeight = innerColChars.height,
      innerColSVG = innerColChars.plotVar,
      xInnerColScale = innerColChars.xScale,
      yInnerColScale = innerColChars.yScale;

  var outerRowChars = createSVG('#outerRlabels', margin = {top: 0, right: 15, bottom: 0, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0}),
      outerRowWidth = outerRowChars.width,
      outerRowHeight = outerRowChars.height,
      outerRowSVG = outerRowChars.plotVar,
      xOuterRowScale = outerRowChars.xScale,
      yOuterRowScale = outerRowChars.yScale;

  var innerRowChars = createSVG('#innerRlabels', margin = {top: 0, right: 15, bottom: 0, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0}),
      innerRowWidth = innerRowChars.width,
      innerRowHeight = innerRowChars.height,
      innerRowSVG = innerRowChars.plotVar,
      xInnerRowScale = innerRowChars.xScale,
      yInnerRowScale = innerRowChars.yScale;

  var heatmapChars = createSVG('#heatmap', margin = {top: 0, right: 15, bottom: 0, left: 0}, padding = {top: 0, right: 0, bottom: 0, left: 0}),
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
  var rowLabelTable = getRowlist(dataAll, outerRowName, innerRowName);
  //Create the column label lookup table
  var colLabelTable = getRowlist(dataAll, outerColName, innerColName);;

          //SET THE INITIAL STATE OF THE OUTER LABELS

  var outerRowState = initializeOuterRowState(rowLabelTable)
  outerRowState = setOuterRowState(outerRowState, "Meso-level: Business Environment")

  var rowPosData = setOuterRowPosition(outerRowState, heatmapHeight, innerRowWidth)

  console.table(rowPosData)








  var currentGridData = gridData(3, 4, heatmapWidth, heatmapHeight)
  console.log(currentGridData)


  /*
  #################################################
  SECTION 3: POSITIONING THE LABELS
  #################################################
  */
  console.table(rowPosData)
  var outerLabels = innerRowSVG.append('g').selectAll(".outerRowLabels")
    .data(rowPosData)
    .enter().append("text")
    .attr("text-anchor", "end")
    .attr('x', function(d){ return d.x})
    .attr('y', function(d) {return d.y})
    .text(function(d) {return d.name})
    .attr("class", "outerRowLabels")
    //.attr("text-align", "right")

  /*
  #################################################
  SECTION 3: CREATE THE HEATMAP STRUCTURE
  #################################################
  */
  var row = heatmapSVG.selectAll(".row")
    .data(currentGridData)
    .enter().append("g")
    .attr("class", "row");


  var column = row.selectAll(".square")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("class","square")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("width", function(d) { return d.width; })
    .attr("height", function(d) { return d.height; })
    .style("fill", "#fff")
    .style("stroke", "#222");




  /*
  #################################################
  SECTION 3.1: SETTING UP THE GLOBAL VARIABLES AND DRAWING AREAS
  To-Dos: 1.
  #################################################
  */
        //PRODUCTIVITY CHART
  //Creating the svg
  // var prodChartVars = createSVG('#prodChart', margin = {top: 5, right: 5, bottom: 0, left: 40}, padding = {top: 5, right: 15, bottom: 2, left: 2}),
  //     prodWidth = prodChartVars.width,
  //     prodHeight = prodChartVars.height,
  //     prodPlot = prodChartVars.plotVar,
  //     xProdScale = prodChartVars.xScale,
  //     yProdScale = prodChartVars.yScale;
  //
  //       //EMPLOYMENT CHART
  // //Creating the svg
  // var empChartVars = createSVG('#empChart', margin = {top: 5, right: 5, bottom: 0, left: 40}, padding = {top: 5, right: 2, bottom: 2, left: 15}),
  //     empWidth = empChartVars.width,
  //     empHeight = empChartVars.height,
  //     empPlot = empChartVars.plotVar,
  //     xEmpScale = empChartVars.xScale,
  //     yEmpScale = empChartVars.yScale;
  //
  // // Creating the tool tip for both the scatter plots
  // var toolTip = d3.tip()
  //   .attr('class', 'd3-tip')
  //   .attr('id', 'popUp')
  //   .offset([10, 5])
  //     .direction('e');


  }
