(function() {
    var viewport = getViewportDimensions();
    var isMobile = viewport.width < 1000
    var margin = {top: 0, right: 0, bottom: 0, left: 0}

    var cfg = {
        viz: {
            width: viewport.width - margin.left - margin.right,
            height: viewport.height - margin.top - margin.bottom,
            isMobile: isMobile
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
                filename: "economic-classifications.png",
            }
        },
        topSection: {
            height: 40,
        },
        leftSection: {
            width: isMobile ? viewport.width * 1/2 : viewport.width * 2/5 
        },
        rightSection: {
            width: isMobile ? viewport.width * 1/2 : viewport.width * 3/5 
        },
    }

    var container = d3.select(".department-econ4")
    var model = JSON.parse(container.attr("data-openspending-model"));
    var progNameRef = getProgNameRef(model);
    var subprogNameRef = getSubprogNameRef(model);
    var econ4Ref = getEconClass4Ref(model);
    var valueField = "value.sum"

    var wrapWidth = 280;
    var mainConfig = {
        container: container,
        url: container.attr("data-aggregate-url")
    }


    var heightOffset = 0;

    /* Create the select box (temporary until we have a design */
    var topSection = mainConfig.container
        .append("div").classed("top-section", true)
        .style("height", cfg.topSection.height)

    var selectBox = topSection.append("select")


    var svg = createSVG(mainConfig.container, viewport.width, viewport.height)
        .style("margin", 0)
        .call(addLinearGradient, "bar-gradient")
        .attr("transform", "translate(0, 5)")


    /* Headings */
    var programmesSection = svg
        .append("g")
            .classed("programmes-section", true)

    var subprogrammesSection = createMainLabel(programmesSection, "SUB-PROGRAMMES")
    var valueSection = createMainLabel(programmesSection, "VALUE")
        .attr("transform", "translate(" + cfg.leftSection.width + ", 0)")


    heightOffset += getDimensions(programmesSection).height
    heightOffset += 15 // TODO height units?

    var headingLine = svg.append("line")
        .attr("x1", 0)
        .attr("x2", viewport.width)
        .attr("y1", heightOffset)
        .attr("y2", heightOffset)
        .classed("heading-line", true)

    //heightOffset = getDimensions(headingLine).y
    heightOffset += 20 // TODO height units

    var valuesSection = svg
        .append("g")
            .classed("values-section", true)
            .attr("transform", "translate(0, " + heightOffset + ")")



    var unique_index = function(data, key) {
        return d3.nest()
            .key(function(d) { return d[key]})
            .entries(data)
    }

    var displayClassification = function(data, container) {
        return function(classification) {
            container.selectAll("*").remove()
            var econ4 = unique_index(data, econ4Ref);
            var subprogrammes = unique_index(data, subprogNameRef);
            filtered_data = data.filter(function(d) {
                return d[econ4Ref] == classification;
            })

            var max_value = d3.max(filtered_data, function(d) { return d[valueField]; })
            var maxBarLength = cfg.rightSection.width * 2 / 3
            scaleBar = d3.scaleLinear().domain([0, max_value]).range([0, maxBarLength])

            var nestedData = d3.nest()
                .key(function(d) { return d[progNameRef]})
                .key(function(d) { return d[subprogNameRef]})
                .rollup(function(leaves) {
                    return d3.sum(leaves, function(leaf) { return leaf[valueField] });
                })
                .entries(filtered_data)

            var offset = 0 // TODO fix this - not sure why the transform on the container isn't working
            var programmeRowPadding = 10 // TODO move this to the config section
            var subprogrammeRowPadding = 8 // TODO move this to the config section

            for (idx in nestedData) {
                var programmeData = nestedData[idx];

                programmeRow = container.append("g")
                    .classed("programme-row", true)
                    .attr("transform", "translate(0, " + offset + ")")
                    .append("text")
                        .text(programmeData.key)
                        .call(wrap, cfg.leftSection.width)

                offset += getDimensions(programmeRow).height + subprogrammeRowPadding

                for (idx2 in programmeData.values) {
                    var row = container.append("g")
                    var backgroundRect = row.append("rect")

                    var subprogrammeData = programmeData.values[idx2];
                    var subprogrammeRow = row.append("g")
                        .classed("subprogramme-row", true)
                        .attr("transform", "translate(4, " + offset + ")")
                        .append("text")
                            .text(subprogrammeData.key)
                            .each(textBump)
                            .call(wrap, cfg.leftSection.width, 1.1)

                    var dimensions = getDimensions(subprogrammeRow);


                    backgroundRect
                        .classed("background-rect", true)
                        .attr("x", 0)
                        .attr("y", offset) // TODO Figure out how to calculate 10 which is the lineheight
                        .attr("width", cfg.leftSection.width - 5)
                        .attr("height", dimensions.height + 4)

                    row.attr("transform", "translate(0, -12)")

                    var gridLines = container.append("g")


                    // Hack to display gradient - display the gradient full
                    // width then draw a white box over it to cover up the
                    // unused part of the rectangle
                    // TODO current assumption is that the background is white
                    // - might want to paramaterise it
                    barRect = container.append("rect")
                       .classed("bar-rect", true)
                       .attr("x", cfg.leftSection.width)
                       .attr("y", offset - 10)
                       .attr("width", maxBarLength)
                       .attr("height", 14)

                    barRect = container.append("rect")
                       .classed("bar-rect", true)
                       .attr("x", cfg.leftSection.width)
                       .attr("y", offset - 10)
                       .attr("width", maxBarLength - scaleBar(subprogrammeData.value) + 1)
                       .attr("height", 16)
                       .style("fill", "white")
                       .attr("transform", "translate(" + scaleBar(subprogrammeData.value) + ", -1)")

                    value = container.append("text")
                        .classed("spend-value", true)
                        .text(rand_fmt(subprogrammeData.value))
                        .attr("transform", "translate(" + (cfg.leftSection.width + scaleBar(subprogrammeData.value) + 5) + ", " + (offset) + ")")
                        .style("fill", "black")


                    offset += getDimensions(subprogrammeRow).height + subprogrammeRowPadding
                }

                offset += programmeRowPadding
            }

            offset -= programmeRowPadding;

            container
                .append("line")
                    .attr("x1", cfg.leftSection.width)
                    .attr("x2", cfg.leftSection.width)
                    .attr("y1", 0)
                    .attr("y2", offset) // TODO remove the last offset
                    .classed("heading-line", true)

            var numTicks = 3
            var xAxis = d3.axisBottom(scaleBar)
                .ticks(numTicks)
                .tickFormat(rand_human_fmt)

            container
                .append("g")
                    .attr("transform", "translate(" + cfg.leftSection.width + ", " + offset + ")")
                    .call(xAxis)

            container
                .append("g")
                    .selectAll("line")
                    .data(scaleBar.ticks(numTicks))
                    .enter()
                    .append("line")
                        .attr("x1", function(d) { return cfg.leftSection.width + scaleBar(d); })
                        .attr("x2", function(d) { return cfg.leftSection.width + scaleBar(d); })
                        .attr("y1", 0)
                        .attr("y2", offset)
                        .classed("gridline", true)

            var bottomPadding = 50;
            bbox = getDimensions(container)
            svg.attr("height", bbox.height + bottomPadding)
            pymChild.sendHeight()

        }
    }


    function getSelectedCategory(el) {
        idx = el.selectedIndex
        value = el.options[idx].value;
    }

    d3.json(mainConfig.url, function(data) {
        data = data.cells;

        var econ4 = unique_index(data, econ4Ref);
        var subprogrammes = unique_index(data, subprogNameRef);
        var max_value = d3.max(data, function(d) { return d[valueField]; })

        var funcDisplay = displayClassification(data, valuesSection);

        selectBox
           .on("change", function(d, i) {
                getSelectedCategory(d3.event.srcElement)
                funcDisplay(value)
           })
            .classed("account-select", true)
            .selectAll("option")
            .data(econ4)
            .enter()
            .append("option")
                .text(function(d) { return d.key;})


        getSelectedCategory(selectBox.node())
        funcDisplay(value)

    })
})()
