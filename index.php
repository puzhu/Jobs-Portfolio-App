<?php
// header('Location: /index.html');
// header('X-Frame-Options: SAMEORIGIN');
header("Cache-Control: no-cache, must-revalidate"); //HTTP 1.1
header("Pragma: no-cache"); //HTTP 1.0
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
header("X-XSS-Protection: 1; mode=block"); //X-XSS-Protection
header('X-Content-Type-Options: nosniff'); //Prevent MIME types security risk
?>

<!DOCTYPE html>
<html>
<meta charset="utf-8">
<meta http-equiv="Cache-control" content="no-store">

<head>
<title>Jobs  Data Visualization Tool</title>

<link rel="stylesheet" href="libs/font-awesome/css/font-awesome.min.css">
<link rel="stylesheet" href="libs/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet" href="styles/main.css">
<link rel="stylesheet" href="styles/tool-tip-style.css">
<script src="libs/jquery-2.2.4.min.js"></script>
<link href="libs/select2-4.0.3/dist/css/select2.min.css" rel="stylesheet" />
<script src="libs/select2-4.0.3/dist/js/select2.min.js"></script>
</head>
<body>
  <div class="container">
    <div class="row" id='lead-section'>
      <h2>Jobs Visualization Tool</h2>
      <p>
        The jobs visualization tool is an interactive graphic that analyzes the World Bank project interventions and the outcomes they target. The portfolio of World Bank projects in the last decade (FY 2005- FY 2018) form the basis of the tool. The vertical axis represent policy interventions at macro level, sectoral level and policies related to labor. Outcomes on the horizontal axis relate to job creation, job quality and job access in addition to intermediate outcomes. Cell colors represent the frequency of an intervention targeting a particular outcome- darker colors represent higher frequencies. Definitions of the interventions and the outcomes can be found <a href="data/Definitions for Data Visualization.pdf" target="_blank">here</a>. A guide to using the tool can be found <a href="data/DATA VIZUALIZATION TOOL_MANUAL_FINAL.pdf" target="_blank">here</a>.
      </p>
    </div>
    <div class="col-sm-12" id="controls">
      <div class="col-sm-2 text-center" id="country">
        <div class="row"><p>Select Country</p></div>
        <div class="row">
          <select id="countryList" style="width: 95%">
            <option value="World" selected="selected">World</option>
          </select>
        </div>

      </div>
      <div class="col-sm-2 text-center" id="GP">
        <div class="row"><p>GP List</p></div>
        <div class="row">
          <select id="gpList" style="width: 95%">
            <option value="All GPs" selected="selected">All GPs</option>
          </select>
        </div>
      </div>
      <div class="col-sm-2 text-center" id="region">
        <div class="row"><p>Region List</p></div>
        <div class="row">
          <select id="regionList" style="width: 95%">
            <option value="World" selected="selected">World</option>
          </select>
        </div>
      </div>
      <div class="col-sm-2 text-center" id="projectStatus">
        <div class="row"><p>Project Status</p></div>
        <div class="row">
          <select id="projectStatusList" style="width: 95%">
            <option value="All Projects" selected="selected">All Projects</option>
          </select>
        </div>
      </div>
      <div class="col-sm-2 text-center" id="moneyCount">
        <div class="row"><p>Count/Money (mill. USD)</p></div>
        <div class="row">
          <label class="switch">
            <input type="checkbox" id="moneyCountSwitch">
            <div class="slider round"></div>
          </label>
        </div>
      </div>
      <div class="col-sm-2">
        <div class="row saveButtons text-center">
          <button class="btn btn-sm btn-default" id="downloadButton" style="width: 80%" onclick="window.exportData()"><i class="fa fa-floppy-o fa-fw" aria-hidden="true"></i>    Data</button>
        </div>
        <div class="row saveButtons text-center">
          <button class="btn btn-sm btn-default" id="saveChartButton" style="width: 80%"><i class="fa fa-floppy-o fa-fw" aria-hidden="true"></i>    Chart</button>
        </div>

      </div>

    </div>
    <div class="row" id="charts">
      <div id="heatmap">
      </div>
    </div>

  </div>
  <script>
    $(function() {
      var div = $('#heatmap');
      var width = div.width();

      div.css('height', width * 0.7);
    });
  </script>


  <!-- <script src="scripts/preventCJ.js"></script> -->
  <!-- <script src="https://npmcdn.com/simple-statistics@2.0.0-beta3/dist/simple-statistics.min.js"></script> -->


  <script src="libs/bootstrap/js/bootstrap.min.js"></script>
  <script src="libs/d3.min.js"></script>
  <!-- <script src="libs/d3-tool-tip.js"></script> -->
  <script src="libs/saveSvgAsPng/saveSvgAsPng.js"></script>
  <script src="libs/alasql.min.js"></script>
	<script src="scripts/main.js"></script>
</body>
</html>
