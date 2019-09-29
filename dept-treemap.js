(function() {
        urlTemplate = "https://openspending.org//api/3/cubes/b9d2af843f3a7ca223eea07fb608e62a:estimates-of-national-expenditure-2019-20-uploaded-2019-02-20t1910/aggregate/?pagesize=10000&cut=budget_phase.budget_phase%3AMain+appropriation%7Cfinyear.finyear%3A2019%7Cvoteno.department%3AXXX&drilldown=progno.programme%7Csprogno.subprogramme"
        var mainConfig = findUrlAndContainer(urlTemplate, d3.select("#my_dataviz"), "department-treemap");

        var viewport = getViewportDimensions();

        // set the dimensions and margins of the graph
        var margin = {top: 100, right: 0, bottom: 0, left: 0},
            width = viewport.width - margin.left - margin.right,
            height = viewport.height - margin.top - margin.bottom,
            x = d3.scaleLinear().domain([0, width]).range([0, width]),
            y = d3.scaleLinear().domain([0, height]).range([0, height]);

        var programmeOffset = 62;
        var budgetOffset = 86;

        var svg = createSVG(mainConfig.container, viewport.width, viewport.height);

        var labels = svg
            .append("g")
                .classed("top-labels", true);

        var treemap = svg.append("g");

        var nester = d3
            .nest()
            .key(function(d) { return d["progno.programme"]})

        var programmeButton = labels
            .append("g")
                .classed("programme-button", true)

        createMainLabel(programmeButton, "PROGRAMME")

        var programmeLabel = labels
            .append("text")
                .classed("programme-label", true)
                .text("All programmes")
                .attr("transform", "translate(5, " + programmeOffset + ")")

        var programmeBudgetLabel = labels
            .append("text")
                .classed("programme-budget-label", true)
                .text("R0")
                .attr("transform", "translate(5, " + budgetOffset + ")")

        var subprogrammeButton = labels
            .append("g")
                .classed("subprogramme-button", true)
                .attr("transform", "translate(" + (width / 1.8 - 10) + ", 0)")


        createMainLabel(subprogrammeButton, "SUB-PROGRAMME")

        var subprogrammeLabel = labels
            .append("text")
                .classed("subprogramme-label", true)
                .text("None selected")
                .attr("transform", "translate(" + (width / 1.8 - 5) + ", " + programmeOffset + ")")

        var subprogrammeBudgetLabel = labels
            .append("text")
                .classed("subprogramme-budget-label", true)
                .text("R0")
                .attr("transform", "translate(" + (width / 1.8 - 5) + ", " + budgetOffset + ")")

        labels
            .append("line")
                .classed("label-separator", true)
                .attr("x1", width / 1.9)
                .attr("x2", width / 1.9)
                .attr("y1", 0)
                .attr("y2", 70)


function addProgrammeLabels(d) {
    var subprogrammes = d.parent.data.values;
    var maxBudget = d3.max(subprogrammes, function(x) { return x["value.sum"] })
    var budget = d.data["value.sum"];

    if (budget == maxBudget) {
        if (d.ry1 - d.ry0 > 30) {
            return d.data["progno.programme"]
        } else {
            return ""
        }
    }
}

function addSubprogrammeLabels(key, currency) {
    return function(d) {
        if (d.data[key] == "Public Administration Policy Analysis") {
            console.log(d);
        }
        if (d.ry1 - d.ry0 > 50 && d.rx1 - d.rx0 > 100) {
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

    parent = d.parent;
    // unzoom if already zoomed
    if (
           x.domain()[0] == parent.x0 && x.domain()[1] == parent.x1
        && y.domain()[0] == parent.y0 && y.domain()[1] == parent.y1
    ) {
        x.domain([0, width]);
        y.domain([0, height]);
        parent = d.parent.parent;
    } else {
        x.domain([parent.x0, parent.x1]);
        y.domain([parent.y0, parent.y1]);
    }

    updateRangeCoordinates(d3.selectAll(".box").data(), x, y)

    var clamp = function(scale, val) {
        if (val < scale.domain()[0])
            return scale.range()[0];
        else if (val > scale.domain()[1])
            return scale.range()[1];
        else
            return scale(val)
    }


    var t = d3.transition()
        .duration(800)
        .ease(d3.easeCubicOut);

    d3.selectAll("rect.tile")
        .transition(t)
        .attr('x', function (d) { return clamp(x, d.x0) })
        .attr('y', function (d) { return clamp(y, d.y0) })
        .attr('width',  function(d) { return clamp(x, d.x1) - clamp(x, d.x0) })
        .attr('height', function(d) { return clamp(y, d.y1) - clamp(y, d.y0) })

    function displayLabels(d) {
        if (d.x0 < x.domain()[0] || d.x1 > x.domain()[1]
            || d.y0 < y.domain()[0] || d.y1 > y.domain()[1])
            return "none";
        return "block"
    }

    d3.selectAll(".box .programme-label tspan")
        .transition(t)
        .attr("x", function(d) { return clamp(x, d.x0) + 5})
        .attr("y", function(d) { return clamp(y, d.y0) + 28})
        .text(addProgrammeLabels)
        .style("display", displayLabels)

    d3.selectAll(".box .subprogramme-label tspan")
        .transition(t)
        .attr("x", function(d) { return clamp(x, d.x0) + 5})
        .attr("y", function(d) { return clamp(y, d.y1) - 30})
        .text(addSubprogrammeLabels("sprogno.subprogramme"))
        .style("display", displayLabels)

    d3.selectAll(".box .subprogramme-budget-label tspan")
        .transition(t)
        .attr("x", function(d) { return clamp(x, d.x0) + 5})
        .attr("y", function(d) { return clamp(y, d.y1) - 6})
        .text(addSubprogrammeLabels("value.sum", true))
        .style("display", displayLabels)
}


//d3.json(mainConfig.url).then(function(data) {
d3.json(mainConfig.url, function(data) {
    data = data.cells.sort(function(a, b) {
        return b["value.sum"] - a["value.sum"];
    });

    var nested_data = nester.entries(data);

    var root = d3.hierarchy(
        {values:nested_data},
        function(d) { return d.values }
    )
    .sum(function(d) { return d["value.sum"]})

    // Then d3.treemap computes the position of each element of the hierarchy
    d3.treemap()
        .size([width, height])
        .padding(1)
        .paddingOuter(3)
        (root)

    updateRangeCoordinates(root.leaves(), x, y)


    // TODO double check this
    treemap.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");


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
            .attr('width', function (d) { return x(d.x1 - d.x0)})
            .attr('height', function (d) { return y(d.y1 - d.y0)})
            .style("fill", function(d, idx) {
                var programmes = root.data.values.map(function(d) { return d.key});
                var subprogrammes = d.parent.data.values;
                var subprogramme_labels = subprogrammes.map(function(d) { return d["sprogno.subprogramme"];});

                var idx = programmes.indexOf(d.data["progno.programme"])
                var idx2 = subprogramme_labels.indexOf(d.data["sprogno.subprogramme"]);
                var hues = colorMap[idx];
                return hues[idx2];
             })
            .on("mouseover", function(d) {
                programmeLabel.text(d.data["progno.programme"])
                subprogrammeLabel.text(d.data["sprogno.subprogramme"])
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
    boxes
        .append("text")
            .classed("programme-label", true)
            .attr("x", function(d) { return d.x0 + 5})
            .attr("y", function(d) { return d.y0 + 28})
            .text(addProgrammeLabels)
            .attr("font-size", "0.6em")
            .attr("fill", "white")
            .call(crop)

    // Add subprogramme labels
    boxes
        .append("text")
            .classed("subprogramme-label", true)
            .attr("x", function(d) { return d.x0 + 5})
            .attr("y", function(d) { return d.y1 - 30})
            .text(addSubprogrammeLabels("sprogno.subprogramme"))
            .attr("font-size", "0.6em")
            .attr("fill", "white")
            .call(crop)

    // Add subprogramme budgets
    boxes
        .append("text")
            .classed("subprogramme-budget-label", true)
            .attr("x", function(d) { return d.x0 + 5})
            .attr("y", function(d) { return d.y1 - 8})
            .text(addSubprogrammeLabels("value.sum", true))
            .attr("font-size", "0.6em")
            .attr("fill", "white")
            .call(crop)

    programmeBudgetLabel
        .datum(root)
        .text(function(d) {
            return rand_fmt(d.value)
    })
})
})()
