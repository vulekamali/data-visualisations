import {scaleBand, scaleLinear} from 'd3-scale';
import {max} from 'd3-array';

export function reusableBarChart(selection) {
    let initialConfiguration = {
        width: 300,
        height: 200,
        data: [],
        colorScale: d3.scaleOrdinal(d3.schemeSet3),
        tooltipFormatter: (data) => {
            return `${data.label} ${data.value}`;
        }
    };

    let width = initialConfiguration.width,
        height = initialConfiguration.height,
        data = initialConfiguration.data,
        colorScale = initialConfiguration.colorScale,
        tooltipFormatter = initialConfiguration.tooltipFormatter;
    let updateData = null;


    function chart(selection) {
        selection.each(function (data) {
            const barChartSvg = selection.append('svg')
                .attr('height', height)
                .attr('width', width)
                .attr("id", `${id}_svg`);

            const xScale = scaleBand()
                .domain(data.map(d => d.label))
                .range([0, width])
                .padding(0.1);

            const yScale = scaleLinear()
                .domain([0, max(data, d => d.value)])
                .range([height, 0]);

            // const tooltip = d3.tip()
            //     .attr("class", "d3-tip")
            //     .offset([-8, 0])
            //     .html(tooltipFormatter);
            //
            // barChartSvg.call(tooltip);

            barChartSvg.append("g")
                .selectAll("rect")
                .data(data)
                .enter()
                .append("rect")
                .attr('class', 'bar')
                .attr("x", d => xScale(d.label))
                .attr("y", d => yScale(d.value))
                .attr("width", xScale.bandwidth())
                .attr("height", d => height - yScale(d.value))
                .attr("fill", (d, i) => colorScale(i))
                .on("mouseover", function (d) {
                    // tooltip.show(d);
                })
                .on("mouseout", function () {
                    // tooltip.hide();
                });

            // Reselecting otherwise it only draws them on the second call
            // why is this necessary? Is there a better way?
            // bars = svg.select("g").selectAll(".bar").data(data);
            //
            // // update bar sizes and positions
            // bars
            //     .attr("x", function (d) {
            //         return xScale(d.label);
            //     })
            //     .attr("width", xScale.bandwidth())
            //     .attr("y", function (d) {
            //         return yScale(d.value);
            //     })
            //     .attr("height", function (d) {
            //         return height - yScale(d.value);
            //     });

            updateData = function () {

                xScale.domain(data.map(d => d.label));
                yScale.domain([0, max(data, d => d.value)]);

                const updatedBars = barChartSvg.selectAll('.bar').data(data);

                updatedBars
                    .enter().append("rect")
                    .attr('class', 'bar')
                    .attr("x", d => xScale(d.label))
                    .attr("y", d => yScale(d.value))
                    .attr("width", xScale.bandwidth())
                    .attr("height", d => height - yScale(d.value))
                    .attr("fill", (d, i) => colorScale(i))
                    .on("mouseover", function (d) {
                        // tooltip.show(d);
                    })
                    .on("mouseout", function () {
                        // tooltip.hide();
                    });

                updatedBars
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(750)
                    .attr("x", d => xScale(d.label))
                    .attr("y", d => yScale(d.value))
                    .attr("width", xScale.bandwidth())
                    .attr("height", d => height - yScale(d.value))
                    .attr("fill", (d, i) => colorScale(i));

                updatedBars.exit()
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(100)
                    .remove();
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
