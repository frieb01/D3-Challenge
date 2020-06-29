function makeResponsive() {  
  let svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
    svgArea.remove();
  }

  let svgWidth;
  if (window.innerWidth > 1500) {
    svgWidth = 1500;
  } 
  else {
    svgWidth = window.innerWidth;
  };
  let svgHeight;
  if (window.innerHeight > 750) {
    svgHeight = 750;
  } 
  else {
    svgHeight = window.innerHeight;
  };

  let margin = {
    top: 20,
    right: 40,
    bottom: 110,
    left: 110
  };

  let width = svgWidth - margin.left - margin.right;
  let height = svgHeight - margin.top - margin.bottom;

  let svg = d3.select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  let chosenXAxis = "poverty";
  let chosenYAxis = "healthcare";

  function xScale(healthData, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis] * .9),
        d3.max(healthData, d => d[chosenXAxis])])
      .range([0, width]);

    return xLinearScale;
  }

  function yScale(healthData, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis] *.9),
        d3.max(healthData, d => d[chosenYAxis])])
      .range([height, 0]);

    return yLinearScale;
  }

  function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }

  function renderXCircles(circlesGroup, newXScale, chosenXAxis, circleLabels) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));

    circleLabels.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));

    return circlesGroup, circleLabels;
  }

  function renderYCircles(circlesGroup, newYScale, chosenYAxis, circleLabels) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));

    circleLabels.transition()
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]));

    return circlesGroup, circleLabels;
  }

  function updateToolTip(healthData, chosenXAxis, chosenYAxis, circlesGroup) {
    let label1;
    let label2;

    function assignLabel(state) {
      let data = healthData.filter(abbr => abbr.abbr == state);

      if (chosenXAxis == "poverty") {
        data.forEach(function(d) {
          label1 = `Poverty: <strong>${d.poverty}%</strong>`});
      }
      if (chosenXAxis == "age") {
        data.forEach(function(d) {
          label1 = `Age: <strong>${d.age} years</strong>`});
      }
      if (chosenXAxis == "income") {
        data.forEach(function(d) {
          label1 = `Income: <strong>$${d.income}</strong>`});
      }
      if (chosenYAxis == "obesity") {
        data.forEach(function (d) {
          label2 = `Obesity: <strong>${d.obesity}%</strong>`});
      }
      if (chosenYAxis == "smokes") {
        data.forEach(function(d) {
          label2 = `Smokes: <strong>${d.smokes}%</strong>`});
      }
      if (chosenYAxis == "healthcare") {
        data.forEach(function(d) {
          label2 = `Lacks Healthcare: <strong>${d.healthcare}%</strong>`});
      }

      return label1, label2
    }

    let toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        let state = d.abbr;
        assignLabel(state);
        return (`<strong>${d.state}</strong><br>${label1}<br>${label2}`);
      });

    let selection = d3.selectAll(".stateCircle");

    selection.call(toolTip);

    selection.on("mouseover", function(data) {
      toolTip.show(data);
    })
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });

    return circlesGroup;
  }

  d3.csv("data.csv").then(function(healthData) {
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    let xLinearScale = xScale(healthData, chosenXAxis);

    let yLinearScale = yScale(healthData, chosenYAxis);

    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    let yAxis = chartGroup.append("g")
      .call(leftAxis);

    let stateCircles = chartGroup.selectAll("g")
      .data(healthData)
      .enter()
      .append("g")
      .classed("stateCircle", true)

    let circlesGroup = stateCircles.append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .attr("fill", "cadetblue")
      .attr("opacity", ".6")

    let circleLabels = stateCircles.append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]))
      .attr("stroke", "white")
      .classed("stateText", true)
      .text(d => d.abbr);

    let labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let povertyLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 25)
      .attr("value", "poverty")
      .classed("axis-text", true)
      .classed("active", true)
      .text("In Poverty (%)");

    let ageLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 52)
      .attr("value", "age")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Age (Median)");

    let incomeLabel = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 80)
      .attr("value", "income")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Household Income (Median)");

    // append y axis
    let healthcareLabel = chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left / 2)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "healthcare")
      .classed("axis-text", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    let smokesLabel = chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left / 1.35)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "smokes")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Smokes (%)");
    
    let obesityLabel = chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value", "obesity")
      .classed("axis-text", true)
      .classed("inactive", true)
      .text("Obese (%)");

    circlesGroup = updateToolTip(healthData, chosenXAxis, chosenYAxis, circlesGroup);

    chartGroup.selectAll("text")
    .on("click", function() {
      let value = d3.select(this).attr("value");

      if (value !== chosenYAxis) {
        chosenYAxis = value;

        yLinearScale = yScale(healthData, chosenYAxis);

        yAxis = renderYAxes(yLinearScale, yAxis);

        circlesGroup, circleLabels = renderYCircles(circlesGroup, yLinearScale, chosenYAxis, circleLabels);

        circlesGroup = updateToolTip(healthData, chosenXAxis, chosenYAxis, circlesGroup);

        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

    labelsGroup.selectAll("text")
      .on("click", function() {
        let value = d3.select(this).attr("value");

        if (value !== chosenXAxis) {
          chosenXAxis = value;

          xLinearScale = xScale(healthData, chosenXAxis);

          xAxis = renderXAxes(xLinearScale, xAxis);

          circlesGroup, circleLabels = renderXCircles(circlesGroup, xLinearScale, chosenXAxis, circleLabels);

          circlesGroup = updateToolTip(healthData, chosenXAxis, chosenYAxis, circlesGroup);

          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "income") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });
  });
}

makeResponsive();

d3.select(window).on("resize", makeResponsive);