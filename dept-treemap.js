(function() {
    var treemap;
    var treemapOuterPadding = 0;
    var treemapInnerPadding = 0;
    var treemapOffsets = {
        programme: { x: 4, y: 16 },
        subprogramme : {
            label: { x: 5, y: -24 },
            budget: { x: 5, y: -8 }
        },
        label: {
            programme: 52,
            budget: 72,
            separator: -25
        },
        treemap: {
            margin: 5,
            minSubprogrammeHeight: 70,
            minSubprogrammeWidth: 100,
        }
    }

    d3.select("head").append("script")
        .attr("src", "https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js")

    d3.select("head").append("script")
        .attr("src", "polyfill.js")

    var container = d3.select(".department-subprogramme-treemap")

    var mainConfig = {
        container: container,
        url: container.attr("data-aggregate-url"),
    }

    var model = JSON.parse(container.attr("data-openspending-model"));
    var progNameRef = getProgNameRef(model);
    var subprogNameRef = getSubprogNameRef(model);
    var valueField = "value.sum"

    var viewport = getViewportDimensions();

    // set the dimensions and margins of the graph
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = viewport.width - margin.left - margin.right,
        height = viewport.height - margin.top - margin.bottom

    var largestBudget = function(d) {
        var subprogrammes = d.parent.data.values;
        return d3.max(subprogrammes, function(x) { return x[valueField] })
    }

    function addProgrammeLabels(d) {
        var maxBudget = largestBudget(d)
        var budget = d.data[valueField];

        if (budget == maxBudget) {
            return d.data[progNameRef]
        }
    }

    function fadeProgramme(d, i) {
        var maxBudget = largestBudget(d)
        var budget = d.data[valueField];

        if (budget == maxBudget) {
            var minX = d3.min(d.parent.children, function(el) { return x(el.x0);})
            var maxX = d3.max(d.parent.children, function(el) { return x(el.x1);})
            var width = maxX - minX;

            fade(d3.select(this), width)
        }
    }

    function addSubprogrammeLabels(key, currency) {
        return function(d) {
            if (d.ry1 - d.ry0 > treemapOffsets.treemap.minSubprogrammeHeight && d.rx1 - d.rx0 > treemapOffsets.treemap.minSubprogrammeWidth) {
                if (currency)
                    return rand_human_fmt(d.data[key])
                return d.data[key]
            } else {
                return ""
            }
        }
    }

    function updateRangeCoordinates(data, x, y) {
        data.map(function(d) {
            d.rx0 = x(d.x0);
            d.rx1 = x(d.x1);
            d.ry0 = y(d.y0);
            d.ry1 = y(d.y1);
        })
    }

    function zoom(d) {

        function displayLabels(d) {
            if (d.x0 < x.domain()[0] || d.x1 > x.domain()[1]
                || d.y0 < y.domain()[0] || d.y1 > y.domain()[1])
                return "none";
            return "block"
        }

        var t = d3.transition()
            .duration(800)
            .ease(d3.easeCubicOut);

        var parent = d.parent;
        // unzoom if already zoomed
        if (
               x.domain()[0] == parent.x0 && x.domain()[1] == parent.x1
            && y.domain()[0] == parent.y0 && y.domain()[1] == parent.y1
        ) {
            x.domain([0, width]);
            y.domain([0, treemapHeight]);
            parent = d.parent.parent;
        } else {
            x.domain([parent.x0, parent.x1]);
            y.domain([parent.y0, parent.y1]);

        }

        updateRangeCoordinates(d3.selectAll(".box").data(), x, y)

        d3.selectAll("rect.tile")
            .transition(t)
            .attr('x', function (d) { return x(d.x0) })
            .attr('y', function (d) { return y(d.y0) })
            .attr('width',  function(d) { return x(d.x1) - x(d.x0)})
            .attr('height', function(d) { return y(d.y1) - y(d.y0)})


        treemap.selectAll(".programme-label tspan")
            .transition(t)
            .attr("x", function(d) { return x(d.x0) + treemapOffsets.programme.x})
            .attr("y", function(d) { return y(d.y0) + treemapOffsets.programme.y})
            .style("display", displayLabels)
            .text(addProgrammeLabels)
            .on("end", function() {
                treemap.selectAll(".programme-label tspan")
                    .text(addProgrammeLabels)
                    .each(fadeProgramme)
            })


        d3.selectAll(".box .subprogramme-label tspan")
            .transition(t)
            .attr("x", function(d) { return x(d.x0) + treemapOffsets.subprogramme.label.x})
            .attr("y", function(d) { return y(d.y1) + treemapOffsets.subprogramme.label.y})
            .text(addSubprogrammeLabels(subprogNameRef))
            .style("display", displayLabels)

        d3.selectAll(".box .subprogramme-budget-label tspan")
            .transition(t)
            .attr("x", function(d) { return x(d.x0) + treemapOffsets.subprogramme.budget.x})
            .attr("y", function(d) { return y(d.y1) + treemapOffsets.subprogramme.budget.y})
            .text(addSubprogrammeLabels(valueField, true))
            .style("display", displayLabels)
    }


    var svg = createSVG(mainConfig.container, viewport.width, viewport.height)
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .call(addLinearGradient, "text-fade", "rgb(255,255,255)", "rgb(255,255,255)", "95%", "100%", 1, 0)

    var labels = svg.append("g")
            .classed("top-labels", true);

    var nester = d3
        .nest()
        .key(function(d) { return d[progNameRef]})

    var programmeButton = labels
        .append("g")
            .classed("programme-button", true)
            .call(createMainLabel, "PROGRAMME")

    var programmeLabel = labels
        .append("text")
            .classed("programme-label", true)
            .text("All programmes")
            .attr("transform", "translate(0, " + treemapOffsets.label.programme + ")")

    var programmeBudgetLabel = labels
        .append("text")
            .classed("programme-budget-label", true)
            .text("R0")
            .attr("transform", "translate(0, " + treemapOffsets.label.budget + ")")

    var subprogrammeButton = labels
        .append("g")
            .classed("subprogramme-button", true)
            .attr("transform", "translate(" + (width / 1.8 - 10) + ", 0)")
            .call(createMainLabel, "SUB-PROGRAMME")

    var subprogrammeLabel = subprogrammeButton
        .append("text")
            .classed("subprogramme-label", true)
            .text("None selected")
            .attr("transform", "translate(0, " + treemapOffsets.label.programme + ")")

    var subprogrammeBudgetLabel = subprogrammeButton
        .append("text")
            .classed("subprogramme-budget-label", true)
            .text("R0")
            .attr("transform", "translate(0, "  + treemapOffsets.label.budget + ")")

    var labelDimensions = getDimensions(labels);

    subprogrammeButton
        .append("line")
            .classed("label-separator", true)
            .attr("x1", treemapOffsets.label.separator)
            .attr("x2", treemapOffsets.label.separator)
            .attr("y1", labelDimensions.y)
            .attr("y2", labelDimensions.height + labelDimensions.y)

    var saveButtonMargin = 10;
    var saveButtonHeight = 30;
    var saveButtonWidth = 140;
    var treemapHeight = height - labelDimensions.height - labelDimensions.y - treemapOffsets.treemap.margin  - saveButtonMargin - saveButtonHeight;
    var labelsMargin = labelDimensions.y + labelDimensions.height + treemapOffsets.treemap.margin;

    var x = d3.scaleLinear().domain([0, width]).range([0, width]).clamp(true)
    var y = d3.scaleLinear().domain([0, treemapHeight]).range([0, treemapHeight]).clamp(true);

    treemap = svg.append("g")
        .attr("transform", "translate(" + -treemapOuterPadding * 2 + ", " + labelsMargin + ")")

    var saveButtonContainer = createSaveButton(svg, {width: saveButtonWidth, height: saveButtonHeight}, viewport.width, viewport.height)
        .attr("transform", "translate(" + (width - saveButtonWidth)  + ", " + (treemapHeight + labelsMargin + saveButtonMargin) + ")")



    d3.json(mainConfig.url, function(data) {
        data = data.cells.sort(function(a, b) {
            return b[valueField] - a[valueField];
        });

        var nested_data = nester.entries(data);

        var root = d3.hierarchy(
            {values:nested_data},
            function(d) { return d.values }
        )
        .sum(function(d) { return d[valueField]})

        // Then d3.treemap computes the position of each element of the hierarchy
        d3.treemap()
            .size([width, treemapHeight])
            .padding(treemapInnerPadding)
            .paddingOuter(treemapOuterPadding)
            (root)

        updateRangeCoordinates(root.leaves(), x, y)

        var boxes = treemap
            .selectAll("g")
            .data(root.leaves())
            .enter()
            .append("g")
                .classed("box", true)

        // Add rectangles
        boxes
            .append("rect")
                .classed("tile", true)
                .attr('x', function (d) {return x(d.x0)})
                .attr('y', function (d) { return y(d.y0)})
                .attr('width', function (d) {return x(d.x1 - d.x0)})
                .attr('height', function (d) { return y(d.y1 - d.y0)})
                .attr("data-programme", function(d, i) {
                    return slugify(d.data[progNameRef])
                })
                .style("fill", function(d, idx) {
                    var programmes = root.data.values.map(function(d) { return d.key});
                    var subprogrammes = d.parent.data.values;
                    var subprogramme_labels = subprogrammes.map(function(d) { return d[subprogNameRef];});

                    var idx = programmes.indexOf(d.data[progNameRef])
                    var idx2 = subprogramme_labels.indexOf(d.data[subprogNameRef]);
                    var hues = colorMap[idx];
                    return hues[idx2];
                 })
                .on("mouseover", function(d) {
                    programmeLabel.text(d.data[progNameRef])
                    subprogrammeLabel.text(d.data[subprogNameRef])
                    programmeBudgetLabel.text(rand_fmt(d.parent.value));
                    subprogrammeBudgetLabel.text(rand_fmt(d.value));

                })
                .on("mouseout", function(d) {
                    programmeBudgetLabel.text(rand_fmt(d.parent.parent.value))
                    programmeLabel.text("All programmes")
                    subprogrammeLabel.text("None selected")
                    subprogrammeBudgetLabel.text("R0")
                })
                .on("click", zoom)

        // Add programme labels
        treemap
            .selectAll(".programme-label")
            .data(root.leaves())
            .enter()
            .append("text")
                .classed("programme-label", true)
                .attr("x", function(d) { return d.x0 + treemapOffsets.programme.x})
                .attr("y", function(d) { return d.y0 + treemapOffsets.programme.y})
                .text(addProgrammeLabels)
                .attr("font-size", "0.6em")
                .attr("fill", "white")
                .each(fadeProgramme)
        
        // Add subprogramme labels
        boxes
            .append("text")
                .classed("subprogramme-label", true)
                .attr("x", function(d) { return d.x0 + treemapOffsets.subprogramme.label.x})
                .attr("y", function(d) { return d.y1 + treemapOffsets.subprogramme.label.y})
                .text(addSubprogrammeLabels(subprogNameRef))
                .attr("font-size", "0.6em")
                .attr("fill", "white")
                .each(function(d, i) {
                    var width = d.x1 - d.x0;
                    fade(d3.select(this), width - 5)
                })

        // Add subprogramme budgets
        boxes
            .append("text")
                .classed("subprogramme-budget-label", true)
                .attr("x", function(d) { return d.x0 + treemapOffsets.subprogramme.budget.x})
                .attr("y", function(d) { return d.y1 + treemapOffsets.subprogramme.budget.y})
                .text(addSubprogrammeLabels(valueField, true))
                .attr("font-size", "0.6em")
                .attr("fill", "white")
                .call(fade)

        programmeBudgetLabel
            .datum(root)
            .text(function(d) {
                return rand_fmt(d.value)
        })

    })
})()
