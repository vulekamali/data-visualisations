import {select} from 'd3-selection';
import {scaleBand, scaleLinear} from 'd3-scale';
import {max} from 'd3-array';

export function reusableBarChart(selection) {
    let initialConfiguration = {
        width: 300,
        height: 200,
        data: [],
        colorScale: d3.scaleOrdinal(d3.schemeSet3),
        tooltipFormatter: (data) => {
            return `${data.name} ${data.value}`;
        }
    };

    let width = initialConfiguration.width,
        height = initialConfiguration.height,
        data = initialConfiguration.data,
        colorScale = initialConfiguration.colorScale,
        tooltipFormatter = initialConfiguration.tooltipFormatter;
    let updateData = null;


    function chart(selection) {
        // create scales and set ranges
        const xScale = scaleBand()
            .range([0, width])
            .padding(0.1);

        const yScale = scaleLinear()
            .range([height, 0]);

        selection.each(function (data) {
            // update scale domains
            xScale.domain(data.map(function (d) {
                return d.label;
            }));
            yScale.domain([0, max(data, function (d) {
                return d.value;
            })]);

            // Select the svg element, if it exists.
            let svg = select(this).selectAll("svg").data([data]);
            const svgEnter = svg.enter().append("svg");
            const gEnter = svgEnter.append("g");

            // reselecting otherwise it only finds and resizes on the second call.
            // why is this necessary? Is there a better way?
            svg = select(this).selectAll("svg");

            // Update the outer dimensions.
            svg.attr("width", width)
                .attr("height", height);

            let bars = svg.select("g").selectAll(".bar").data(data);

            bars.enter()
                .append("rect")
                .attr("class", "bar");

            // Reselecting otherwise it only draws them on the second call
            // why is this necessary? Is there a better way?
            bars = svg.select("g").selectAll(".bar").data(data);

            // update bar sizes and positions
            bars
                .attr("x", function (d) {
                    return xScale(d.label);
                })
                .attr("width", xScale.bandwidth())
                .attr("y", function (d) {
                    return yScale(d.value);
                })
                .attr("height", function (d) {
                    return height - yScale(d.value);
                });

            updateData = function () {
                // groupsScale.domain(getXDomainValues(data));
                // xAxis.scale(groupsScale);
                //
                // innerGroupScale
                //     .domain([...new Set(data.map(v => v.groupKey))])
                //     .rangeRound([0, groupsScale.bandwidth()]);
                //
                // yDomainValues = getYDomainValues(data);
                // yScale.domain([d3.min(yDomainValues), d3.max(yDomainValues)]);
                //
                // yAxis.scale(yScale);
                //
                // const t = d3.transition()
                //     .duration(750);
                //
                // gXAxis.transition(t)
                //     .call(xAxis);
                //
                // gYAxis.transition(t)
                //     .call(yAxis);
                //
                // Utils.applyAxisStyle(gXAxis);
                // Utils.applyAxisStyle(gYAxis);
                //
                // const updatedBars = barChartSvg.selectAll('.bar').data(data);
                //
                // updatedBars
                //     .enter().append("rect")
                //     .attr('class', 'bar')
                //     .attr("x", d => innerGroupScale(d.groupKey) + groupsScale(d.key))
                //     .attr("y", d => yScale(d.value))
                //     .attr("width", innerGroupScale.bandwidth())
                //     .attr("height", d => height - yScale(d.value) - margin.bottom)
                //     .attr("fill", d => colorScale(d.groupKey))
                //     .on("mouseover", function (d) {
                //         tooltip.show(d);
                //
                //     })
                //     .on("mouseout", function () {
                //         tooltip.hide();
                //     });
                //
                // updatedBars
                //     .transition()
                //     .ease(d3.easeLinear)
                //     .duration(750)
                //     .attr("x", d => innerGroupScale(d.groupKey) + groupsScale(d.key))
                //     .attr("y", d => yScale(d.value))
                //     .attr("width", innerGroupScale.bandwidth())
                //     .attr("height", d => height - yScale(d.value) - margin.bottom)
                //     .attr("fill", d => colorScale(d.groupKey));
                //
                // updatedBars.exit()
                //     .transition()
                //     .ease(d3.easeLinear)
                //     .duration(100)
                //     .remove();
                //
                // // svg.select('.title').text(`${yAxisLabel} vs ${xAxisLabel}`);
                // barChartSvg.select('.x.axis.label').text(xAxisLabel);
                // barChartSvg.select('.y.axis.label').text(yAxisLabel);
            };
        });

    }

    chart.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.colorScale = function (value) {
        if (!arguments.length) return colorScale;
        colorScale = value;
        return chart;
    };

    chart.tooltipFormatter = function (value) {
        if (!arguments.length) {
            return tooltipFormatter
        } else {
            if (value == null) {
                tooltipFormatter = initialConfiguration.tooltipFormatter;
            } else {
                tooltipFormatter = value;
            }
            return chart;
        }
    };

    chart.data = function (value) {
        if (!arguments.length) return data;
        data = value;
        if (typeof updateData === 'function') updateData();
        return chart;
    };

    return chart;
}
