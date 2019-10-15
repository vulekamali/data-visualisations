function createMainLabel(container, label, config) {
    var config = config || {};
    var padding = config.padding || 5;

    var programmeButton = container
        .append("g")
            .classed("main-label", true)

    var background = programmeButton
        .append("rect")
            .attr("rx", 3)
            .attr("ry", 3)
            .attr("x", 0)
            .attr("y", 0)

    var text = programmeButton
        .append("text")
            .text(label)
            .each(textBump)

    var bbox = text.node().getBBox();

    background
        .attr("width", bbox.width + 2 * padding)
        .attr("height", bbox.height + 2 * padding)

    verticalAlign(background, text)
    centerAlign(background, text)
    return programmeButton;
}

function createSaveButton(container, width, height, imageWidth, imageHeight) {
    var containerBBox = container.node().getBBox()
    var saveButtonContainer = container.append("g")
        .classed("save-button", true)
        .on("click", function() {
            saveSvgAsPng(container.node(), "diagram.png", {
                backgroundColor : "white",
                left : -10,
                width: imageWidth + 20,
                top: -10,
                height: imageHeight - 20
            });
        })

    var saveButtonRect = saveButtonContainer.append("rect")
        .attr("width", width)
        .attr("height", height)
            .attr("rx", 3)
            .attr("ry", 3)

    var saveButtonContents = saveButtonContainer.append("g")

    var saveButtonText = saveButtonContents.append("text")
        .text("Download Image")
        .attr("text-anchor","left")
        .each(textBump)

    var saveButtonImageGroup = saveButtonContents
        .append("g")

    var saveButtonImage = saveButtonImageGroup
        .append("path")
            .attr("d", "M459,408V51c0-28.05-22.95-51-51-51H51C22.95,0,0,22.95,0,51v357c0,28.05,22.95,51,51,51h357 C436.05,459,459,436.05,459,408z M140.25,267.75l63.75,76.5l89.25-114.75L408,382.5H51L140.25,267.75z")
            .attr("transform", "scale(0.03, 0.03)")

    leftMargin(saveButtonImageGroup, saveButtonText, 5)

    centerAlign(saveButtonContainer, saveButtonContents)
    verticalAlign(saveButtonImageGroup, saveButtonText)
    verticalAlign(saveButtonRect, saveButtonContents)

        d3.selectAll("button")
            .on("click", function() {
                svg = d3.selectAll("svg")
                    .attr("viewport", "(0, 0 1000, 800)")
                saveSvgAsPng(svg.node(), "diagram.png");
            })

    return saveButtonContainer
}

function createSVG(container, width, height) {
    var svg = container
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .classed("svg-content-responsive", true)

    return svg
}

function addLinearGradient(container, id, color1, color2, offset1, offset2, opacity1, opacity2) {
    var gradient = container
        .append("defs")
            .append("linearGradient")
                .attr("id", id)
                .attr("x1", "0%")
                .attr("y1", "100%")
                .attr("x2", "100%")
                .attr("y2", "100%")

    offset1 = offset1 != undefined ? offset1 : "0%";
    offset2 = offset2 != undefined ? offset2 : "0%";
    opacity1 = opacity1 != undefined ? opacity1 : "0%";
    opacity2 = opacity2 != undefined ? opacity2 : "0%";

    gradient.append("stop")
        .attr("offset", offset1)
        .attr("stop-color", color1)
        .style("stop-opacity", opacity1)

    gradient.append("stop")
        .attr("offset", offset2)
        .attr("stop-color", color2)
        .style("stop-opacity", opacity2)
}


function centerAlign(el1, el2) {
    var bbox1 = el1.node().getBBox()
    var bbox2 = el2.node().getBBox()
    var leftMargin = (bbox1.width - bbox2.width) / 2
    var currentTransforms = el2.attr("transform") || ""

    el2.attr("transform", "translate(" + leftMargin + ", 0) " + currentTransforms)
}

function verticalAlign(el1, el2) {
    var bbox1 = el1.node().getBBox()
    var bbox2 = el2.node().getBBox()
    var topMargin = (bbox1.height - bbox2.height) / 2
    var currentTransforms = el2.attr("transform") || ""

    el2.attr("transform", "translate(0, " + topMargin + ") " + currentTransforms)
}

function leftMargin(el1, el2, margin) {
    var bbox1 = el1.node().getBBox()
    var left = (bbox1.width + margin)
    var currentTransforms = el2.attr("transform") || ""

    el2.attr("transform", "translate(" + left + ", 0) " + currentTransforms)
}

function textBump() {
    var text = d3.select(this) 
    var bbox = text.node().getBBox()
    var currentTransforms = text.attr("transform") || ""
    text
        .attr("transform", "translate(0, " + bbox.height + ") " + currentTransforms)
        .attr("dy", "-0.2em")
}

function transform(selection, transform) {
    a = selection.attr("transform", function(d, i) {
        var me = d3.select(this)
        return transform + " " + me.attr("transform")
    })
}

colorMap = [
    ["#2C35AA", "#4050C7", "#5D76F4", "#546BE7", "#5D76F4", "#788FF7", "#96A7F9", "#B2BEFA", "#D2D9FC", "#E7EAFC"],
    ["#7D1D4E", "#9F2757", "#B22E5B", "#C73361", "#D63864", "#DA4F7A", "#DF6B92", "#E793B0", "#EFBED0", "#F8E5EC"],
    ["#1D4B40", "#2C675C", "#33776B", "#3C877B", "#429388", "#52A39A", "#6AB4AC", "#91C9C4", "#BBDEDB", "#E3F1F1"],
    ["#E68537", "#EEAB46", "#F2C34F", "#F8DA58", "#FCEC60", "#FDEF72", "#FDF288", "#FEF5A8", "#FEF9CA", "#FFFDE9"],
    ["#3A2723", "#4A352F", "#594139", "#684D43", "#74564A", "#886F65", "#9D8980", "#B9AAA5", "#D5CCC9", "#EEEBE9"],
    ["#000000", "#212121", "#424242", "#616161", "#757575", "#9E9E9E", "#BDBDBD", "#E0E0E0", "#EEEEEE", "#F5F5F5"],
    ["#285F63", "#39818D", "#4295A5", "#4CA9BE", "#54B9D1", "#60C4D7", "#74CEDE", "#97DCE8", "#BEEAF1", "#E4F7FA"]
]

colorMap2 = ["#4B5DD6", "#4C2EA2", "#8F31AA", "#CB332B", "#33776B", "#749D47", "#F2C34F", "#E68231", "#594139", "#495A63"];
