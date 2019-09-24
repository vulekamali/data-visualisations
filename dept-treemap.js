(function() {
        var container = d3.selectAll("[data-viz-type=department-treemap]")
        var url = container.attr("data-url")

        var baseWidth = 800;
        var baseHeight = baseWidth;

        // set the dimensions and margins of the graph
        var margin = {top: 80, right: 10, bottom: 10, left: 0},
            width = baseWidth - margin.left - margin.right,
            height = baseHeight - margin.top - margin.bottom,
            x = d3.scaleLinear().domain([0, width]).range([0, width]),
            y = d3.scaleLinear().domain([0, height]).range([0, height]);
        var cols = ["#1E4C41", "#EE783E",  "#1C4897", "#D33630", "#594139", "#255214", "#B14121"]

        // append the svg object to the body of the page
        var svg = container
            .append("svg")
                .attr("viewBox", "0 0 " + baseWidth + " " + baseHeight)
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .attr("preserveAspectRatio", "xMinYMin meet")
                .classed("svg-content-responsive", true)
                .append("g")
                    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // TODO top labels
        var labels = svg
            .append("g")
                .classed("top-labels", true);

        var treemap = svg.append("g");

        var nester = d3
            .nest()
            .key(function(d) { return d["progno.programme"]})

        var programme_label = labels.append("text")
            .classed("heading", true)
            .classed("programme", true);

        var subprogramme_label = labels
            .append("text")
                .attr("dy", "1.2em")
                .classed("heading", true)
                .classed("subprogramme", true)

        var amount_label = labels.append("text")
            .attr("dy", "2.4em")
            .classed("heading", true)
            .classed("amount", true);

        var programmeButton = labels
            .append("g")
                .classed("programme-button", true)
                .attr("transform", "translate(10, 15)")

        programmeButton
            .append("rect")
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("transform", "translate(-7, -15)")

        programmeButton
            .append("text")
                .text("PROGRAMME")

        var programmeLabel = labels
            .append("text")
                .classed("programme-label", true)
                .text("All programmes")
                .attr("transform", "translate(5, 44)")

        var programmeBudgetLabel = labels
            .append("text")
                .classed("programme-budget-label", true)
                .text("R0")
                .attr("transform", "translate(5, 68)")

        var subprogrammeButton = labels
            .append("g")
                .classed("subprogramme-button", true)
                .attr("transform", "translate(" + width / 1.8 + ", 15)")

        subprogrammeButton
            .append("rect")
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("transform", "translate(-7, -15)")

        subprogrammeButton
            .append("text")
                .text("SUB-PROGRAMME")

        var subprogrammeLabel = labels
            .append("text")
                .classed("subprogramme-label", true)
                .text("None selected")
                .attr("transform", "translate(" + (width / 1.8 - 5) + ", 44)")

        var subprogrammeBudgetLabel = labels
            .append("text")
                .classed("subprogramme-budget-label", true)
                .text("R0")
                .attr("transform", "translate(" + (width / 1.8 - 5) + ", 68)")

        labels
            .append("line")
                .classed("label-separator", true)
                .attr("x1", width / 1.9)
                .attr("x2", width / 1.9)
                .attr("y1", 0)
                .attr("y2", 70)

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

    d3.selectAll(".box text")
        .transition(t)
        .attr('x', function (d) { return clamp(x, d.x0) })
        .attr('y', function (d) { return clamp(y, d.y0) })
}


d3.json(url, function(data) {
    data = data.cells;

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
            .style("fill", function(d) {
                var programmes = root.data.values.map(function(d) { return d.key});
                var subprogrammes = d.parent.data.values;
                var minBudget = d3.min(subprogrammes, function(x) { return x["value.sum"] })
                var maxBudget = d3.max(subprogrammes, function(x) { return x["value.sum"] })
                var budget = d.data["value.sum"];

                var colScale = d3.scaleOrdinal().domain(programmes).range(cols)
                var brightScale = d3.scaleLinear().domain([minBudget, maxBudget]).range([0.5, 1])
                var col = d3.color(colScale(d.data["progno.programme"]));

                return col.brighter(brightScale(budget));
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
            .attr("y", function(d) { return d.y0 + 15})
            .text(function(d) {
                var subprogrammes = d.parent.data.values;
                var maxBudget = d3.max(subprogrammes, function(x) { return x["value.sum"] })
                var budget = d.data["value.sum"];
                if (budget == maxBudget) {
                    if (d.x1 - d.x0 > 80 && d.y1 - d.y0 > 30) {
                        return d.data["progno.programme"]
                    } else {
                        return ""
                    }
                }
            })
            .attr("font-size", "0.6em")
            .attr("fill", "white")
            .call(crop)

    // Add subprogramme labels
    boxes
        .append("text")
            .classed("subprogramme-label", true)
            .attr("x", function(d) { return d.x0 + 5})
            .attr("y", function(d) { return d.y1 - 18})
            .text(function(d) {
                if (d.x1 - d.x0 > 80 && d.y1 - d.y0 > 20) {
                    return d.data["sprogno.subprogramme"]
                } else {
                    return ""
                }
            })
            .attr("font-size", "0.6em")
            .attr("fill", "white")
            .call(crop)

    // Add subprogramme budgets
    boxes
        .append("text")
            .classed("subprogramme-budget-label", true)
            .attr("x", function(d) { return d.x0 + 5})
            .attr("y", function(d) { return d.y1 - 6})
            .text(function(d) {
                if (d.x1 - d.x0 > 80 && d.y1 - d.y0 > 20) {
                    return rand_human_fmt(d.data["value.sum"])
                } else {
                    return ""
                }
            })
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
