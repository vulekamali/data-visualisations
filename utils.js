// TODO refactor with crop and wrap
function fade(text, width) {
    text.each(function(d) {
        var text = d3.select(this),
            words = text.text().split("").reverse(),
            word,
            line = [],
            lineNumber = 0,
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0 //parseFloat(text.attr("dy")),

            var tspan = text.text(null)

                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(""));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop()
                text.style("fill", "url(#text-fade)")
                tspan.text(line.join(""));
                break;
            }
        }
    });
}

function crop(text, width) {
    text.each(function(d) {
        var padding = 10;
        // TODO wish there was a cleaner way to pass the width in to this
        // function
        var width = width || (d.x1 - d.x0 - padding);
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop()
                tspan.text(line.join(" "));
            }
        }
    });
}

function wrap(text, width, lineHeight) {
    lineHeight = lineHeight || 1.1; // ems
    text.each(function(d) {
        var padding = 10;
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 0, //parseFloat(text.attr("dy")),
            tspan = text.text(null)
                        .append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                            .attr("x", 0)
                            .attr("y", y)
                            .attr("dy", ++lineNumber * lineHeight + dy + "em")
                            .text(word);
            }
        }
    });
}

function unique(x) {
    return x.reverse().filter(function (e, i, x) {return x.indexOf(e, i+1) === -1;}).reverse();
}

/*
Given an array with the following structure 
[
    {key: value1, a11: b11, c11: d11, .... },
    {key: value1, a12: b12, c12: d12, .... },
    {key: value1, a13: b13, c13: d13, .... },
    {key: value2, a21: b22, c23: d24, .... },
    ...
]

return
[
    {
        key: value1, values: [
            {key: value1, a11: b11, c11: d11, .... },
            {key: value1, a12: b12, c12: d12, .... },
            {key: value1, a13: b13, c13: d13, .... },
        ]
    },
    {
        key: value2, values: [
            {key: value2, a21: b21, c21: d21, .... },
        ]
    }
*/
function regroupByIndex(data, key) {
    return d3.nest()
        .key(function(d) { return d[key]})
        .entries(data)
}


var rand_human_fmt = function(x, longForm) {
    longForm = longForm == undefined ? true : longForm
    suffixBillion = longForm == true ? " billion" : "bn"
    suffixMillion = longForm == true ? " million" : "m"
    suffixThousand = longForm == true ? "  thousand" : "k"

    if (x >= 1000000000) {
        return rand_fmt(x / 1000000000) + suffixBillion
    } else if (x >= 1000000) {
        return rand_fmt(x / 1000000) + suffixMillion
    } else if (!longForm && x >= 100000) {
        return rand_fmt(x / 1000) + suffixThousand
    } else {
        return rand_fmt(x)
    }
}

var rand_fmt = function(x) { 
    return "R" + d3.format(",.0f")(x);
}

var slugify = function(x) {
    return x.replace(/\s+/g, "-").toLowerCase()
}

var getViewportDimensions = function() {
    // Dynamically get the size of the viewport
    var baseWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var baseHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    return {
        width: baseWidth,
        height: baseHeight
    }
}

var getDimensions = function(el) {
    rect = el.node().getBoundingClientRect();
    dim = {
        x: rect.x || rect.left,
        y: rect.y || rect.top,
        width: rect.width,
        height: rect.height,

    }
    dim.bottom = dim.y + dim.height
    dim.right = dim.x + dim.width

    return dim
}

var createBoundingBox = function(container, el) {
    if (el.x != undefined && el.y != undefined && el.width != undefined && el.height != undefined)
        d = el;
    else
        d = getDimensions(el);

    var box = container.append("rect")
        .attr("x", d.x)
        .attr("y", d.y)
        .attr("width", d.width)
        .attr("height", d.height)
        .classed("bounding-box", true)
    return box
}

function constant(x) {
  return function constant() {
    return x;
  };
}
