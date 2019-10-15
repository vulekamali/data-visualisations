(function() {
    // TODO this should be passed in as a parameter
    var container = d3.select(".department-bubbles")
    var viewport = getViewportDimensions();
    var margin = {top: 0, right: 0, bottom: 0, left: 0}

    var cfg = {
        main: {
            url: container.attr("data-aggregate-url")
        },
        viz: {
            width: viewport.width - margin.left - margin.right,
            height: viewport.height - margin.top - margin.bottom,
        },
        separator: { x: 20},
        padding: {
            section: 24,
            box: 15,
        },
        offset: {
            sectionLeft: (viewport.width - 24) / 2,
            sectionRight: viewport.width - (viewport.width - 24) / 2,
        },
        bubbleChart: {
            top: 0,
            height: 0,
            offset: {
                y: 32
            }
        },
        saveButton: {
            margin: 10,
            height: 30,
            width: 140,
        }
    }

    var model = JSON.parse(container.attr("data-openspending-model"));
    var progNameRef = getProgNameRef(model);
    var subprogNameRef = getSubprogNameRef(model);
    var econ4Ref = getEconClass4Ref(model);
    var valueField = "value.sum"
    var bubbleChartTop, bubbleChartHeight;

    x = d3.scaleLinear().domain([0, cfg.viz.width]).range([0, cfg.viz.width]),
    y = d3.scaleLinear().domain([0, cfg.viz.height]).range([0, cfg.viz.height]);


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
                .attr("transform", "translate(0, " + (bbox.y + bbox.height + cfg.padding.section) + ")")
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
        boxDisplacement = boxHeight + cfg.padding.box;

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
                if (d[progNameRef] != programme)
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
            .force("y", d3.forceX(cfg.viz.height / 2).strength(0.1))
            .force("collide", d3.forceCollide(function(d) { return radiusScale(d[valueField])}))

        var radiusScale = d3.scaleSqrt().domain([
            d3.min(data, function(d) { return d[valueField]}),
            d3.max(data, function(d) { return d[valueField]})
        ]).range([viewport.width / 100, viewport.height / 10])

        var circles = container
            .selectAll("g")
            .data(data)
            .enter()
            .append("g")
                .classed("bubble", true)
                .on("mouseover", function(d) {
                    d3.select(".economic-classification").text(d[econ4Ref])
                    d3.select(".budget-amount").text(rand_fmt(d[valueField]))
                })

                .on("click", function(d) {
                    var programme = d[progNameRef]
                    unselect(programme);
                })

        circles
            .append("circle")
                .attr("r", function(d) { return radiusScale(d[valueField]) })
                .style("fill", function(d) {
                    return colScale(d[progNameRef]);
                })
                .classed("econ-circle", true)

        circles
            .append("text")
            .text(function(d) {
                if (radiusScale(d[valueField]) > 20) {
                    return d[econ4Ref]
                } else {
                    return "";
                }
            })
            .classed("econ-label", true)
            .style("font-size", function(d) {
                radius = radiusScale(d[valueField])
                a = Math.min(2 * radius, (2 * radius - 8) / this.getComputedTextLength() * 24) + "px";
                console.log(a)
                return a;
            })
            .attr("dy", ".35em")

        simulation.nodes(data).on("tick", ticked);

        function ticked() {
            circles.attr("transform", function(d) {
                var radius = radiusScale(d[valueField])
                d.y = Math.max(radius, Math.min(cfg.bubbleChart.height - radius - 24, d.y));
                d.x = Math.max(radius, Math.min(cfg.viz.width - (cfg.offset.sectionLeft + cfg.padding.section + radius), d.x));
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

    var svg = createSVG(container, viewport.width, viewport.height)

    var leftSection = svg.append("g").classed("left-section", true);
    var middleSection = svg.append("g").classed("middle-section", true);
    var rightSection = svg
        .append("g")
            .attr("transform", "translate(" + (cfg.offset.sectionLeft + cfg.padding.section) + ", 0)")
            .classed("right-section", true)

    middleSection
        .append("line")
            .classed("label-separator", true)
            .attr("x1", cfg.separator.x)
            .attr("x2", cfg.separator.x)
            .attr("y1", 0)
            .attr("y2", 90)
            .attr("transform", "translate(" + cfg.offset.sectionLeft + ", 0)")

    d3.json(cfg.main.url, function(data) {
        data = data.cells;

        var programmes = unique(data.map(function(d) { return d[progNameRef]; }));
        var colScale = d3.scaleOrdinal().domain(programmes).range(colorMap2)


        legend = createLegend(leftSection, programmes, colScale);
        budgetLabel = createBudgetSection(rightSection);


        bbox = getDimensions(budgetLabel);

        cfg.bubbleChart.top = bbox.y + bbox.height + cfg.bubbleChart.offset.y
        cfg.bubbleChart.height = cfg.viz.height - cfg.bubbleChart.top - cfg.saveButton.height;

        var bubbleChart = rightSection
            .append("g")
                .classed("bubble-chart", true)
                .attr("transform", "translate(0, " + cfg.bubbleChart.top + ")")

        cfgButton = {
            backgroundColor : "white",
            left : -10,
            width: viewport.width + 20,
            top: -10,
            height: viewport.height - 40,
            filename: "programmes.png",
        }
        var saveButtonContainer = createSaveButton(svg, cfg.saveButton.width, cfg.saveButton.height, viewport.width, viewport.height, cfgButton)
            .attr("transform", "translate(" + (cfg.viz.width - cfg.saveButton.width)  + ", " + (viewport.height - cfg.saveButton.height) + ")")

        createCircles(bubbleChart, data, colScale);


    });


})()
