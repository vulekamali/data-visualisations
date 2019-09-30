(function() {
    var urlTemplate = "https://openspending.org//api/3/cubes/b9d2af843f3a7ca223eea07fb608e62a:estimates-of-national-expenditure-2019-20-uploaded-2019-02-20t1910/aggregate/?pagesize=100000&cut=budget_phase.budget_phase%3AMain+appropriation%7Cfinyear.finyear%3A2019%7Cvoteno.department%3AXXX&drilldown=econ4.econ4%7Cprogno.programme";
    var mainConfig = findUrlAndContainer(urlTemplate, d3.select("#my_dataviz"), "department-treemap");

    var viewport = getViewportDimensions();
    var sectionPadding = 24;
    var boxPadding = 15;
    var bubbleChartOffset = 0;
    var sectionLeft = (viewport.width - 24) / 3;
    var sectionRight = viewport.width - (viewport.width - 24) / 3;
    var bubbleChart;

    // set the dimensions and margins of the graph
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = viewport.width - margin.left - margin.right,
        height = viewport.height - margin.top - margin.bottom,
        x = d3.scaleLinear().domain([0, width]).range([0, width]),
        y = d3.scaleLinear().domain([0, height]).range([0, height]);

    var svg = createSVG(mainConfig.container, viewport.width, viewport.height)


    var leftSection = svg.append("g").classed("left-section", true);
    var middleSection = svg.append("g").classed("middle-section", true);
    var rightSection = svg
        .append("g")
            .attr("transform", "translate(" + (sectionLeft + sectionPadding) + ", 0)")
            .classed("right-section", true);

    middleSection
        .append("line")
            .classed("label-separator", true)
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", 90)
            .attr("transform", "translate(" + sectionLeft + ", 0)")
    
    var labels = svg
        .append("g")
            .classed("top-labels", true)
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

    function createBudgetSection(container) {
        var econContainer = container.append("g").classed("budget-section", true);

        var classificationSection = econContainer.append("g").attr("transform", "translate(" + 10 + ", 0)")
        createMainLabel(classificationSection, "ECONOMIC CLASSIFICATION")

        classificationSection.append("text")
            .classed("economic-classification", true)
            .text("None Selected")
            .attr("transform", "translate(6, 55)")

        classificationSection.append("text")
            .classed("budget-amount", true)
            .text("R0")
            .attr("transform", "translate(6, 80)")

        return econContainer

    }

    function createLegend(container, programmes, colScale) {
        var legend = container.
            append("g")
                .classed("legend", true)

        mainLabel = createMainLabel(legend, "PROGRAMME");

        var bbox = getDimensions(mainLabel);

        legendItems = legend
            .append("g")
                .classed("legend-items", true)
                .selectAll(".item")
                .data(programmes)
                .enter()
                .append("g")
                .attr("transform", "translate(0, " + (bbox.y + bbox.height + sectionPadding) + ")")
                    .classed("item", true)
                    .on("click", function(d) { unselect(d); })

        var rects = legendItems
            .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("rx", 8)
                .attr("ry", 8)
                .style("fill", colScale)
                .classed("legend-item-box", true)

        boxHeight = getDimensions(rects).width;
        boxDisplacement = boxHeight + boxPadding;

        rects
            .attr("transform", function(d, idx) {
                return "translate(0, " + (idx * boxDisplacement) + ")"
            })


        var backgroundPadding = 2;
        var legendItemBackgrounds = legendItems
            .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("transform", function(d, idx) {
                    return "translate(" + (boxDisplacement) + ", " + (idx * boxDisplacement - backgroundPadding) + ")"
                })
                .attr("height", boxHeight + 2 * backgroundPadding)
                .classed("legend-item-text-background", true)

        legendItems
            .append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("transform", function(d, idx) {
                    return "translate(" + (boxDisplacement + backgroundPadding * 2) + ", " + (idx * boxDisplacement) + ")"
                })
                .attr("dy", "1em")
                .text(function(d) { return d; })
                .style("fill", "black")
                .classed("legend-item-text", true)

        legendItemBackgrounds
            .each(function(d) {
                var bbox = getDimensions(d3.select(this.nextSibling));
                d3.select(this).attr("width", bbox.width + backgroundPadding * 4);
            });

        return legend;
    }

    function createHead(container, programmes, colScale) {
    }

    function unselect(programme) {
        d3.selectAll(".bubble circle") 
            .classed("unselected", function(d) {
                if (d["progno.programme"] != programme)
                    return !d3.select(this).classed("unselected")
                return false
            })

        d3.selectAll(".legend-items rect") 
            .classed("unselected", function(d) {
                if (d != programme)
                    return !d3.select(this).classed("unselected")
                return false
            })
    }


    function createCircles(container, data, colScale) {
        var simulation = d3.forceSimulation()
            .force("x", d3.forceX(0 / 2).strength(0.1))
            .force("y", d3.forceX(height / 2).strength(0.1))
            .force("collide", d3.forceCollide(function(d) { return radiusScale(d["value.sum"])}))

        var radiusScale = d3.scaleSqrt().domain([
            d3.min(data, function(d) { return d["value.sum"]}),
            d3.max(data, function(d) { return d["value.sum"]})
        ]).range([viewport.height / 100, viewport.height / 10])

        var circles = container
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
                .classed("bubble", true)
                .on("mouseover", function(d) {
                    d3.select(".economic-classification").text(d["econ4.econ4"])
                    d3.select(".budget-amount").text(rand_fmt(d["value.sum"]))
                })

                .on("click", function(d) {
                    var programme = d["progno.programme"]
                    unselect(programme);
                })

        circles
            .append("circle")
                .attr("r", function(d) { return radiusScale(d["value.sum"]) })
                .style("fill", function(d) {
                    return colScale(d["progno.programme"]);
                })
                .classed("econ-circle", true)

        circles
            .append("text")
            .text(function(d) {
                if (radiusScale(d["value.sum"]) > 20) {
                    return d["econ4.econ4"]
                } else {
                    return "";
                }
            })
            .classed("econ-label", true)
            .style("font-size", function(d) {
                radius = radiusScale(d["value.sum"])
                a = Math.min(2 * radius, (2 * radius - 8) / this.getComputedTextLength() * 24) + "px"; 
                console.log(a)
                return a;
            })
            .attr("dy", ".35em")

        simulation.nodes(data).on("tick", ticked);

        function ticked() {
            circles.attr("transform", function(d) {
                var radius = radiusScale(d["value.sum"])
                d.y = Math.max(radius, Math.min(height - bubbleChartOffset - radius - 24, d.y));
                d.x = Math.max(radius, Math.min(width - (sectionLeft + sectionPadding + radius), d.x));
                return "translate(" + d.x + ", " + d.y + ")";
            });

            var bbox = getDimensions(container);
            svg.select(".bubble-chart-bbox")
                .attr("x", bbox.x)
                .attr("y", bbox.y)
                .attr("width", bbox.width)
                .attr("height", bbox.height)
            }
    }


    d3.json(mainConfig.url).then(function(data) {
        data = data.cells;

        var programmes = unique(data.map(function(d) { return d["progno.programme"]; }));
        var colScale = d3.scaleOrdinal().domain(programmes).range(colorMap2)


        legend = createLegend(leftSection, programmes, colScale);

        budgetLabel = createBudgetSection(rightSection);


        bbox = getDimensions(budgetLabel);

        bubbleChartOffset = bbox.y + bbox.height + 32;
        var bubbleChart = rightSection
            .append("g")
                .classed("bubble-chart", true)
                .attr("transform", "translate(0, " + bubbleChartOffset + ")")

        createCircles(bubbleChart, data, colScale);


    });

    
})()
