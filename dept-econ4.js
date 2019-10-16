(function() {
    var viewport = getViewportDimensions();
    var isMobile = viewport.width < 1000
    var margin = {top: 0, right: 0, bottom: 0, left: 0}
    var container = d3.select(".department-econ4")
    var model = JSON.parse(container.attr("data-openspending-model"))

    var cfg = {
        main: {
            url: container.attr("data-aggregate-url")
        },
        data: {
            category: getProgNameRef(model),
            subCategory: getSubprogNameRef(model),
            valueLabel: getEconClass4Ref(model),
            valueField: "value.sum"
        },
        viz: {
            width: viewport.width - margin.left - margin.right,
            height: viewport.height - margin.top - margin.bottom,
            isMobile: isMobile,
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
        bars: {
            heightOffset: 0,
            headingMargin: 15,
            separatorMargin: 20,
            programmeRowPadding: 10,
            subprogrammeRowPadding: 8,
            numTicks: 3,
        }
    }

    var saveButtonContainer;


    /* Create the select box (temporary until we have a design */
    var topSection = container
        .append("div").classed("top-section", true)
        .style("height", cfg.topSection.height)

    var selectBox = topSection.append("select")


    var svg = createSVG(container, viewport.width, viewport.height)
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

    heightOffset = cfg.bars.heightOffset
    heightOffset += getDimensions(programmesSection).height
    heightOffset += cfg.bars.headingMargin

    var headingLine = svg.append("line")
        .attr("x1", 0)
        .attr("x2", viewport.width)
        .attr("y1", heightOffset)
        .attr("y2", heightOffset)
        .classed("heading-line", true)

    //heightOffset = getDimensions(headingLine).y
    heightOffset += cfg.bars.separatorMargin

    var valuesSection = svg
        .append("g")
            .classed("values-section", true)
            .attr("transform", "translate(0, " + heightOffset + ")")

    bbox = getDimensions(container)

    var saveButtonContainer = createSaveButton(
        svg, 
        {width: cfg.saveButton.width, height: cfg.saveButton.height},
        {width: cfg.saveButton.config.width, height: cfg.saveButton.config.height},
        cfg.saveButton.config
    )


    var displayClassification = function(data, container) {
        return function(classification) {
            container.selectAll("*").remove()
            filtered_data = data.filter(function(d) {
                return d[cfg.data.valueLabel] == classification;
            })

            var max_value = d3.max(filtered_data, function(d) { return d[cfg.data.valueField]; })
            var maxBarLength = cfg.rightSection.width * 2/3
            scaleBar = d3.scaleLinear().domain([0, max_value]).range([0, maxBarLength])

            var nestedData = d3.nest()
                .key(function(d) { return d[cfg.data.category]})
                .key(function(d) { return d[cfg.data.subCategory]})
                .rollup(function(leaves) {
                    return d3.sum(leaves, function(leaf) { return leaf[cfg.data.valueField] });
                })
                .entries(filtered_data)

            var offset = 0 // TODO fix this - not sure why the transform on the container isn't working

            for (idx in nestedData) {
                    var programmeData = nestedData[idx];
                    programmeRow = container.append("g")
                        .classed("programme-row", true)
                        .attr("transform", "translate(0, " + offset + ")")
                        .append("text")
                            .text(programmeData.key)
                            .call(wrap, cfg.leftSection.width)

                    offset += getDimensions(programmeRow).height + cfg.bars.subprogrammeRowPadding

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

                        var gridLines = container
                            .append("g")
                                .selectAll("line")
                                .data(scaleBar.ticks(cfg.bars.numTicks))
                                .enter()
                                .append("line")
                                    .classed("gridline", true)

                        value = container.append("text")
                            .classed("spend-value", true)
                            .text(rand_human_fmt(subprogrammeData.value, false))
                            .attr("transform", "translate(" + (cfg.leftSection.width + scaleBar(subprogrammeData.value) + 5) + ", " + (offset) + ")")
                            .style("fill", "black")


                    offset += getDimensions(subprogrammeRow).height + cfg.bars.subprogrammeRowPadding
                }

                offset += cfg.bars.programmeRowPadding
            }

            offset -= cfg.bars.programmeRowPadding;

            var xAxis = d3.axisBottom(scaleBar)
                .ticks(cfg.bars.numTicks)
                .tickFormat(rand_human_fmt)

            gridLines
                .attr("x1", function(d) { return cfg.leftSection.width + scaleBar(d); })
                .attr("x2", function(d) { return cfg.leftSection.width + scaleBar(d); })
                .attr("y1", 0)
                .attr("y2", offset)

            container
                .append("g")
                    .attr("transform", "translate(" + cfg.leftSection.width + ", " + offset + ")")
                    .call(xAxis)


            var bottomPadding = 60;
            bbox = getDimensions(container)
            vizHeight = bbox.height + bottomPadding + cfg.saveButton.height
            svg.attr("height", vizHeight)
            cfg.saveButton.config.height = vizHeight - 10;
            saveButtonContainer.attr("transform", "translate(" + (cfg.viz.width - cfg.saveButton.width)  + ", " + (bbox.height + bottomPadding) + ")")
            //pymChild.sendHeight()

        }
    }


    function getSelectedCategory(el) {
        idx = el.selectedIndex
        value = el.options[idx].value;
    }

    d3.json(cfg.main.url, function(data) {
        data = data.cells;

        var valueIndex = regroupByIndex(data, cfg.data.valueLabel);
        var max_value = d3.max(data, function(d) { return d[cfg.data.valueField]; })

        var funcDisplay = displayClassification(data, valuesSection);

        selectBox
           .on("change", function(d, i) {
                getSelectedCategory(d3.event.srcElement)
                funcDisplay(value)
           })
            .classed("account-select", true)
            .selectAll("option")
            .data(valueIndex)
            .enter()
            .append("option")
                .text(function(d) { return d.key;})


        getSelectedCategory(selectBox.node())
        funcDisplay(value)

    })
})()
