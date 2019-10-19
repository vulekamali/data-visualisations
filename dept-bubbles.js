var valueField = "value.sum"
var viewport = getViewportDimensions();
var econ4Ref = "econ4.econ4"

function BubbleChart(config) {
    var width = constant(600),
        height = constant(600),
        radiusScale = d3.scaleSqrt()
            .domain([0, 100000000])
            .range([0, 10]),
        xForce = constant(0.1),
        yForce = constant(0.1),
        mouseOver = null,
        events = {
            "mouseover": null,
            "click": null,
        },
        bubbleStyle = { "fill": constant("Black") },
        bubbleAttr = { },
        textStyle = { "fill": constant("White") },
        textAttr = { },
        text = null

    function my(selection) {

        selection.each(function(d, i) {
            var container = d3.select(this)
            containerDimensions = {
                x: 0,
                y: 0,
                width: width(),
                height: height(),
                right: width(),
                bottom: height(),
            }

            var centerX = containerDimensions.width
            var centerY = containerDimensions.height

            var simulation = d3.forceSimulation()
                .force("x", d3.forceX(centerX / 2).strength(xForce))
                .force("y", d3.forceY(centerY / 2).strength(yForce))
                .force("collide", d3.forceCollide(function(d) { return radiusScale(d[valueField])}))

            var circles = container
                .selectAll("g")
                .data(d)
                .enter()
                .append("g")
                    .on("mouseover", function(d, i) { if (events["mouseover"]) { events["mouseover"](d, i) } })
                    .on("mousemove", function(d, i) { if (events["mousemove"]) { events["mousemove"](d, i) } })
                    .on("mouseout", function(d, i) { if (events["mouseout"]) { events["mouseout"](d, i) } })
                    .on("click", function(d, i) { if (events["click"]) { events["click"](d, i) } })

            circles
                .append("circle")
                    .attr("r", function(d) {
                        var r = radiusScale(d[valueField]) 
                        if (r < 0)
                            return 0
                        return r
                    })
                    .call(function(selection) {
                        for (attr in bubbleStyle) {
                            func = bubbleStyle[attr]
                            selection.style(attr, func)
                        }

                        for (attr in bubbleAttr) {
                            func = bubbleAttr[attr]
                            selection.attr(attr, func)
                        }
                        
                    })

            if (text) {
                circles
                    .append("text")
                    .text(function(d, i) {
                        return d[econ4Ref]
                    })
                    .attr("dy", ".35em")
                    .call(function(selection) {
                        for (attr in textStyle) {
                            func = textStyle[attr]
                            selection.style(attr, func)
                        }

                        for (attr in textAttr) {
                            func = textAttr[attr]
                            selection.attr(attr, func)
                        }
                        
                    })
                    .style("font-size", function(d) {
                        radius = radiusScale(d[valueField])
                        a = Math.min(2 * radius, (2 * radius - 8) / this.getComputedTextLength() * 24);
                        if (a <= 0)
                            return 0
                        return a + "px"
                    })
            }

            function ticked() {
                circles.attr("transform", function(d) {
                    var radius = radiusScale(d[valueField])

                    d.y = Math.max(radius, Math.min(containerDimensions.bottom - radius, d.y));
                    d.x = Math.max(radius, Math.min(containerDimensions.right - radius * 1, d.x));
                    return "translate(" + d.x + ", " + d.y + ")";
                });
            }
            simulation.nodes(d).on("tick", ticked);
        })
    };

    my.width = function(_) {
        return arguments.length ? (width = typeof _ === "function" ? _ : constant(+_), my) : width;
    };

    my.height = function(_) {
        return arguments.length ? (height = typeof _ === "function" ? _ : constant(+_), my) : height;
    };

    my.radius = function(_) {
        return arguments.length ? (radiusScale = typeof _ === "function" ? _ : constant(+_), my) : radiusScale;
    }

    my.xForce = function(_) {
        return arguments.length ? (xForce = typeof _ === "function" ? _ : constant(+_), my) : xForce;
    }

    my.yForce = function(_) {
        return arguments.length ? (yForce = typeof _ === "function" ? _ : constant(+_), my) : yForce;
    }

    my.on = function(event, func) {
        if (arguments.length == 1) {
            return events[event]            
        } else {
            events[event] = func
        }

        return my
    }

    my.bubbleStyle = function(attr, _) {
        return arguments.length ? (bubbleStyle[attr] = typeof _ === "function" ? _ : constant(+_), my) : bubbleStyle[attr];
    }

    my.textStyle = function(attr, _) {
        return arguments.length ? (textStyle[attr] = typeof _ === "function" ? _ : constant(+_), my) : textStyle[attr];
    }

    my.bubbleAttr = function(attr, _) {
        return arguments.length ? (bubbleAttr[attr] = typeof _ === "function" ? _ : constant(+_), my) : bubbleAttr[attr];
    }

    my.textAttr = function(attr, _) {
        return arguments.length ? (textAttr[attr] = typeof _ === "function" ? _ : constant(+_), my) : textAttr[attr];
    }

    my.text = function(_) {
        return arguments.length ? (text = typeof _ === "function" ? _ : constant(+_), my) : text;
    }

    return my
}

(function() {
    // TODO this should be passed in as a parameter
    var container = d3.select(".department-bubbles")
    var viewport = getViewportDimensions();
    var margin = {top: 0, right: 0, bottom: 0, left: 0}
    var currentSelection = null;

    var cfg = {
        main: {
            url: container.attr("data-aggregate-url"),
            mobileBreakpoint: 500
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
            sectionLeft: (viewport.width - 24) / 3,
            sectionRight: viewport.width - (viewport.width - 24) / 3,
            budgetLabel: 0 // determined at runtime
        },
        bubbleChart: {
            // This gets set later once the data has loaded
            top: 0,
            height: 0,
            offset: {
                y: 10
            },
            densityCoefficient: 0.7 
        },
        saveButton: {
            margin: 10,
            height: 30,
            width: 140,
            config: {
                backgroundColor : "white",
                left : -10,
                width: viewport.width + 20,
                top: -10,
                height: viewport.height - 40,
                filename: "programmes.png",
            }
        }

    }

    var model = JSON.parse(container.attr("data-openspending-model"));
    var progNameRef = getProgNameRef(model);
    var subprogNameRef = getSubprogNameRef(model);
    var bubbleChartTop, bubbleChartHeight;


    function createBudgetSection(container) {
        var econContainer = container.append("g").classed("budget-section", true);

        var classificationSection = econContainer.append("g").attr("transform", "translate(" + 10 + ", 0)")
        createMainLabel(classificationSection, "ECONOMIC CLASSIFICATION")

        classificationSection.append("text")
            .classed("programme", true)
            .text("None Selected")
            .attr("transform", "translate(6, 50)")


        classificationSection.append("text")
            .classed("economic-classification", true)
            .text("None Selected")
            .attr("transform", "translate(6, 65)")

        classificationSection.append("text")
            .classed("budget-amount", true)
            .text("R0")
            .attr("transform", "translate(6, 95)")

        return econContainer

    }

    function createLegend(container, programmes, colScale) {
        var legend = container.
            append("g")
                .classed("legend", true)

        legendItems = legend
            .append("g")
                .classed("legend-items", true)
                .selectAll(".item")
                .data(programmes)
                .enter()
                .append("g")
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

    function unselect(programme) {
        if (currentSelection == null)
            currentSelection = programme
        var newSelection = programme;

        if (programme == currentSelection) {
            currentSelection = null;

            d3.selectAll(".bubble-chart circle")
                .classed("unselected", function(d) {
                    if (d[progNameRef] != programme) {
                        return !d3.select(this).classed("unselected")
                    }
                    return false
                })

            d3.selectAll(".legend-items rect")
                .classed("unselected", function(d) {
                    if (programme == undefined)
                        return false
                    if (d != programme)
                        return !d3.select(this).classed("unselected")
                    return false
                })
        } else {
            d3.selectAll(".bubble-chart circle")
                .classed("unselected", function(d) {
                    if (d[progNameRef] == currentSelection)
                        return true
                    else if (d[progNameRef] == newSelection) {
                        return false
                    } else {
                        return true;
                    }
                })

            d3.selectAll(".legend-items rect")
                .classed("unselected", function(d) {
                    if (d == currentSelection)
                        return true
                    else if (d == newSelection) {
                        return false
                    } else {
                        return true;
                    }
                })
            
        }



        currentSelection = programme;

    }

    function createCircles(container, labelsContainer, data, colScale) {
        bbox = getDimensions(container)
        containerDimensions = {
            left: cfg.offset.sectionLeft + cfg.padding.section,
            right: cfg.viz.width,
            top: 0,
            bottom: cfg.viz.height - cfg.saveButton.height,
            width: cfg.viz.width - cfg.offset.sectionLeft - cfg.padding.section,
            height: (cfg.viz.height - cfg.saveButton.height) - bbox.y
        }
        containerDimensions.x = containerDimensions.left
        containerDimensions.y = containerDimensions.top

        var areaWidth = containerDimensions.width
        var areaHeight = containerDimensions.height
        var Area = (areaWidth * areaHeight)

        var centerX = containerDimensions.width / 2 + containerDimensions.left
        var centerY = containerDimensions.height / 2 + containerDimensions.top 

        var totalValue = d3.sum(data, function(d) { return d[valueField]})
        var maxValue = d3.max(data, function(d) { return d[valueField]})
        var maxRatio = maxValue / totalValue

        var radiusScale = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([0, Math.sqrt(Area) * maxRatio * cfg.bubbleChart.densityCoefficient])

        chart = BubbleChart()
            .width(containerDimensions.width)
            .height(containerDimensions.height)
            .radius(radiusScale)
            .on("mouseover", function(d, i) {
                labelsContainer.select(".programme").text(d[progNameRef])
                labelsContainer.select(".economic-classification").text(d[econ4Ref])
                labelsContainer.select(".budget-amount").text(rand_fmt(d[valueField]))
            })
            .on("click", function(d, i) {
                var programme = d[progNameRef]
                unselect(programme);
            })
            .bubbleStyle("fill", function(d, i) {
                return colScale(d[progNameRef]);
            })
            .text(function(d, i) {
                return d[econ4Ref]
                if (radiusScale(d[valueField]) > 1) {
                    return d[econ4Ref]
                } else {
                    return "";
                }
            })

        var bubbleChartContainer = container
            .datum(data)
            .append("g")
                .classed("bubble-chart", true)
                .call(chart)
    }

    function createLayout(container, mobile) {
    
        var leftSection = svg.append("g").classed("left-section", true)
        var middleSection = svg.append("g").classed("middle-section", true);
        var rightSection = svg.append("g").classed("right-section", true)
        var legendContainer = leftSection.append("g").classed("legend-container", true);

        var mainLabel = createMainLabel(leftSection, "PROGRAMME");

        budgetLabel = createBudgetSection(rightSection);
        bbox = getDimensions(budgetLabel);

        cfg.bubbleChart.top = bbox.y + bbox.height + cfg.bubbleChart.offset.y
        cfg.bubbleChart.height = cfg.viz.height - cfg.bubbleChart.top - cfg.saveButton.height;
        var bubbleChart = rightSection
            .append("g").classed("bubble-chart", true)
            .attr("transform", "translate(0, " + cfg.bubbleChart.top + ")")


        if (!mobile) {
            var bbox = getDimensions(mainLabel);
            legendContainer
                .attr("transform", "translate(0, " + (bbox.y + bbox.height + cfg.padding.section) + ")")

            middleSection
                .append("line")
                    .classed("label-separator", true)
                    .attr("x1", cfg.separator.x)
                    .attr("x2", cfg.separator.x)
                    .attr("y1", 0)
                    .attr("y2", 90)
                    .attr("transform", "translate(" + cfg.offset.sectionLeft + ", 0)")

            rightSection
                .attr("transform", "translate(" + (cfg.offset.sectionLeft + cfg.padding.section) + ", 0)")
                .classed("right-section", true)
        } else {
            leftSection.style("display", "none")
            cfg.offset.sectionLeft = 0
            cfg.padding.section = 0

        }
        return {
            leftSection: leftSection,
            middleSection: middleSection,
            rightSection: rightSection,
            legendContainer: legendContainer,
            bubbleChart: bubbleChart,
            budgetLabel: budgetLabel,
        }
    }

    x = d3.scaleLinear().domain([0, cfg.viz.width]).range([0, cfg.viz.width]),
    y = d3.scaleLinear().domain([0, cfg.viz.height]).range([0, cfg.viz.height]);

    var svg = createSVG(container, cfg.viz.width, cfg.viz.height)
    var isMobile = false
    if (cfg.viz.width < cfg.main.mobileBreakpoint)
        isMobile = true

    var sections = createLayout(svg, isMobile)

    d3.json(cfg.main.url, function(data) {
        data = data.cells;

        var programmes = unique(data.map(function(d) { return d[progNameRef]; }));
        var colScale = d3.scaleOrdinal().domain(programmes).range(colorMap2)

        legend = createLegend(sections.legendContainer, programmes, colScale);
        createCircles(sections.bubbleChart, sections.rightSection, data, colScale);

        var saveButtonContainer = createSaveButton(svg, cfg.saveButton, viewport, cfg.saveButton.config)
            .attr("transform", "translate(" + (cfg.viz.width - cfg.saveButton.width)  + ", " + (viewport.height - cfg.saveButton.height) + ")")



    });


})()
