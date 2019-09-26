function createMainLabel(container, label, config) {
    var config = config || {};
    var padding = config.padding || 5;

    var programmeButton = container
        .append("g")
            .classed("main-label", true)
            .attr("transform", "translate(10, 15)")

    var background = programmeButton
        .append("rect")
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("transform", "translate(-5, -15)")

    var text = programmeButton
        .append("text")
            .text(label)

    var bbox = text.node().getBBox();
    background
        .attr("width", bbox.width + 2 * padding)

    return programmeButton;
}

