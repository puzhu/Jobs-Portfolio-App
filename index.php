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
<title>Jobs Portfolio Visualization</title>

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
      <h2>Jobs Portfolio Dashboard</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus rutrum lorem velit, sed convallis lectus rhoncus sit amet. Proin ut egestas diam. Nullam mi odio, maximus accumsan lacus at, dapibus auctor purus. Vivamus volutpat ante pulvinar neque placerat maximus. Cras malesuada leo eget rutrum lacinia.
      </p>
    </div>
    <div class="row">
      <div class="col-xs-4">
        <div class="row" id="controls">
          <div class="row">
            <div class="col-xs-6" id="country">
              <p>Select Country</p>
              <select id="countryList" style="width: 95%">
                <option value="World" selected="selected">World</option>
              </select>
            </div>
            <div class="col-xs-6" id="GP">
              <p>GP List</p>
              <select id="gpList" style="width: 95%">
                <option value="World" selected="selected">World</option>
              </select>
            </div>
          </div>
          <div class="row">
            <div class="col-xs-6" id="region">
              <p>Region List</p>
              <select id="regionList" style="width: 95%">
                <option value="World" selected="selected">World</option>
              </select>
            </div>
            <div class="col-xs-6" id="moneyCount">
              <p>Money/Count Switch</p>
              <div class="row text-center">
                <label class="switch">
                  <input type="checkbox" id="moneyCountSwitch">
                  <div class="slider round"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="row" id="legendRow">
          <div class="col-xs-6" id="legendText">
            <p></p>
          </div>
          <div class="col-xs-6" id="legend"></div>
        </div>
      </div>
      <div class="col-xs-8">
        <div class="row" id="outerClabels"></div>
        <div class="row" id="innerClabels"></div>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-1" id="outerRlabels"></div>
      <div class="col-xs-3" id="innerRlabels"></div>
      <div class="col-xs-8" id="heatmap"></div>
    </div>

  </div>


  <!-- <script src="scripts/preventCJ.js"></script> -->
  <!-- <script src="https://npmcdn.com/simple-statistics@2.0.0-beta3/dist/simple-statistics.min.js"></script> -->


  <script src="libs/bootstrap/js/bootstrap.min.js"></script>
  <script src="libs/d3.min.js"></script>
  <script src="libs/d3-tool-tip.js"></script>
	<script src="scripts/main.js"></script>
</body>
</html>
