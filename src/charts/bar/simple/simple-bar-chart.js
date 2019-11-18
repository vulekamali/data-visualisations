import { select } from 'd3-selection';
import { scaleLinear, scaleBand } from 'd3-scale';
import { max } from 'd3-array';

let constant = x => () => x;

export function chart(selection) {
  let width = 300,
      height = 200;
  let data = [];
  let x = x = scaleBand()
      .range([0, width])
      .padding(0.1);
  let y = scaleLinear()
      .range([height, 0]);

  selection.each(function(data) {
    // Select the svg element, if it exists.
    const svg = select(this).append("svg").data([data]);
    // Otherwise, create the skeletal chart.
    const gEnter = svg.enter().append("svg").append("g");

    // Update the outer dimensions.
    svg.attr("width", width)
      .attr("height", height);

    x.domain(data.map(function(d) { return d.label; }));
    y.domain([0, max(data, function(d) { return d.value; })]);

    const bars = svg.selectAll(".bar").data(data, d => d.label);

    const barsEntering = bars.enter();

    barsEntering.append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.label); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });
  });

  return chart;
};
