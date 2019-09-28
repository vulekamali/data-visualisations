(function() {
    var urlTemplate = "https://openspending.org//api/3/cubes/b9d2af843f3a7ca223eea07fb608e62a:estimates-of-national-expenditure-2019-20-uploaded-2019-02-20t1910/aggregate/?pagesize=100000&cut=budget_phase.budget_phase%3AMain+appropriation%7Cfinyear.finyear%3A2019%7Cvoteno.department%3AXXX&drilldown=econ4.econ4%7Cprogno.programme";
    var mainConfig = findUrlAndContainer(urlTemplate, d3.select("#my_dataviz"), "department-treemap");

    var viewport = getViewportDimensions();
    
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = viewport.width - margin.left - margin.right,
        height = viewport.height - margin.top - margin.bottom,
        x = d3.scaleLinear().domain([0, width]).range([0, width]),
        y = d3.scaleLinear().domain([0, height]).range([0, height]);

    var svg = createSVG(mainConfig.container, viewport.width, viewport.height)

    var labels = svg
        .append("g")
            .classed("top-labels", true)
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

    var bubbleChart = svg
        .append("g")
            .classed("bubble-chart", true)


    function createBudgetSection(container) {
        var econContainer = container.append("g");

        econContainer
            .append("line")
                .classed("label-separator", true)
                .attr("x1", 0)
                .attr("x2", 0)
                .attr("y1", 0)
                .attr("y2", 90)

        var classifcationSection = econContainer.append("g").attr("transform", "translate(" + 10 + ", 0)")
        createMainLabel(classifcationSection, "ECONOMIC CLASSIFICATION")

        classifcationSection.append("text")
            .classed("economic-classification", true)
            .text("None Selected")
            .attr("transform", "translate(6, 55)")

        classifcationSection.append("text")
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
                .attr("transform", "translate(0, " + (bbox.y + bbox.height) + ")")
                    .classed("item", true)
                    .on("click", function(d) { unselect(d); })

        var rects = legendItems
            .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("rx", 2)
                .attr("ry", 2)
                .style("fill", colScale)
                .classed("legend-item-box", true)

        boxHeight = getDimensions(rects).width;
        boxDisplacement = boxHeight + 15;

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
                d3.select(this).attr("width", bbox.width + 20);
            });

        return legend;
    }

    function createHead(container, programmes, colScale) {
        legend = createLegend(container, programmes, colScale);
        budgetLabel = createBudgetSection(container);
        var bbox = getDimensions(legend);
        budgetLabel.attr("transform", "translate(" + (bbox.x + bbox.width) + ", 0)")
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
        ]).range([10, 100])

        var circles = container
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
                .classed("bubble", true)
                .on("mouseover", function(d) {
                    d3.select(".top-labels .economic-classification").text(d["econ4.econ4"])
                    d3.select(".top-labels .budget-amount").text(rand_fmt(d["value.sum"]))
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
                d.y = Math.max(radius * 2, Math.min(height - 30*margin.bottom - radius, d.y));
                d.x = Math.max(radius, Math.min(width - radius, d.x));
                return "translate(" + d.x + ", " + d.y + ")";
            });

            var bbox = getDimensions(bubbleChart);
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

        createHead(labels, programmes, colScale);

        var bbox = getDimensions(labels);
        bubbleChart.attr("transform", "translate(0, " + (bbox.x + bbox.height) + ")")
        createCircles(bubbleChart, data, colScale);

        var bbox = getDimensions(labels);
        svg.append("rect")
            .attr("x", bbox.x)
            .attr("y", bbox.y)
            .attr("width", bbox.width)
            .attr("height", bbox.height)
            .classed("bounding-box", true)

        var bbox = getDimensions(d3.select(".bubble-chart"));
        svg.append("rect")
            .attr("x", bbox.x)
            .attr("y", bbox.y)
            .attr("width", bbox.width)
            .attr("height", bbox.height)
            .classed("bubble-chart-bbox", true)
            .attr("transform", "translate(0, " + margin.top + ")")
            .classed("bounding-box", true)

        svg.append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", viewport.width - margin.left - margin.right)
            .attr("height", viewport.height - margin.bottom - margin.top)
            .classed("bounding-box", true)

    });

    
})()
