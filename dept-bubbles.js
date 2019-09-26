(function() {
    var nester = d3
        .nest()
        .key(function(d) { return d["progno.programme"]})

    var baseWidth = 800;
    var baseHeight = baseWidth;
    
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = baseWidth - margin.left - margin.right,
        height = baseHeight - margin.top - margin.bottom,
        x = d3.scaleLinear().domain([0, width]).range([0, width]),
        y = d3.scaleLinear().domain([0, height]).range([0, height]);

    container = d3.selectAll("[data-viz-type=department-bubblechart]")

    var svg = container
        .append("svg")
            .attr("viewBox", "0 0 " + baseWidth + " " + baseHeight)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .classed("svg-content-responsive", true)
            .append("g")

    var labels = svg
        .append("g")
            .classed("top-labels", true);

    var bubbleChart = svg
        .append("g")
            .attr("transform", "translate(0, " + 100 + ")");


    function createBudgetSection(container) {
        container
            .append("line")
                .classed("label-separator", true)
                .attr("x1", width / 2)
                .attr("x2", width / 2)
                .attr("y1", 20)
                .attr("y2", 90)

        var econclass = container
            .append("g")
                .attr("transform", "translate(" + width / 1.9 + ", 20)")

        createMainLabel(econclass, "ECONOMIC CLASSIFICATION")

        econclass.append("text")
            .classed("economic-classification", true)
            .text("None Selected")
            .attr("transform", "translate(6, 45)")

        econclass.append("text")
            .classed("budget-amount", true)
            .text("R0")
            .attr("transform", "translate(6, 70)")

    }

    function createLegend(container, programmes, colScale) {
        var legend = container.
            append("g")
                .classed("legend", true)

        var boxSpace = 33;
        createMainLabel(legend, "PROGRAMME");

        legendItems = legend
            .append("g")
                .classed("legend-items", true)
                .selectAll(".item")
                .data(programmes)
                .enter()
                .append("g")
                .attr("transform", "translate(0, 8)")
                    .classed("item", true);
        legendItems
            .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("rx", 2)
                .attr("ry", 2)
                .attr("transform", function(d, idx) {
                    return "translate(5, " + (idx * boxSpace + 30) + ")"
                })
                .style("fill", colScale)
                .classed("legend-item-box", true)

        var legendItemBackgrounds = legendItems
            .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("transform", function(d, idx) {
                    return "translate(30, " + (idx * boxSpace + 27) + ")"
                })
                .classed("legend-item-text-background", true)

        legendItems
            .append("text")
                .attr("x", 0)
                .attr("y", 0)
                .attr("transform", function(d, idx) {
                    return "translate(40, " + (idx * boxSpace + 45) + ")"
                })
                .text(function(d) { return d; })
                .style("fill", "black")
                .classed("legend-item-text", true)

        legendItemBackgrounds
            .each(function(d) {
                console.log(d);
                var bbox = this.nextSibling.getBBox();
                d3.select(this).attr("width", bbox.width + 20);
            });

        legend
            .attr("transform", "translate(0, " + 20 + ")")


        return legend;
    }

    function createHead(container, programmes, colScale) {
        legend = createLegend(container, programmes, colScale);
        budgetLabel = createBudgetSection(container);
    }


    function createCircles(data, colScale) {

        d3.pack()
            .size([width, height])(data)

        var circles = bubbleChart
            .selectAll("g")
            .data(data.leaves())
            .enter()
            .append("g")
                .classed("bubble", true)
                .attr("transform", function(d) {
                    return "translate(" + d.x + ", " + d.y + ")";
                })
            .on("mouseover", function(d) {
                d3.select(".top-labels .economic-classification").text(d.data["econ4.econ4"])
                d3.select(".top-labels .budget-amount").text(rand_fmt(d.data["value.sum"]))
            });

        circles
            .append("circle")
                .attr("r", function(d) { return d.r })
                .style("fill", function(d) {
                    return colScale(d.data["progno.programme"]);
                })
                .classed("econ-circle", true)

        circles
            .append("text")
            .text(function(d) {
                console.log(d);
                if (d.r > 20) {
                    return d.data["econ4.econ4"]
                } else {
                    return "";
                }
            })
            .classed("econ-label", true)
            .style("font-size", function(d) {
                return Math.min(2*d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "px"; 
            })
            .attr("dy", ".35em")
    }


    d3.json("econ4.json", function(data) {
        data = data.cells;

        var nested_data = nester.entries(data);

        var root = d3.hierarchy(
            {values:nested_data},
            function(d) { return d.values }
        )
        .sum(function(d) { return d["value.sum"]})

        var programmes = root.data.values.map(function(d) { return d.key});
        var colScale = d3.scaleOrdinal().domain(programmes).range(colorMap2)

        createHead(labels, programmes, colScale);
        createCircles(root, colScale);


    });

    
})()
