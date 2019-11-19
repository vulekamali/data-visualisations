import {scaleBand, scaleLinear} from 'd3-scale';
import {max} from 'd3-array';
import {transition} from 'd3-transition';
import {easeLinear} from 'd3-ease';
import d3Tip from "d3-tip";

export function reusableBarChart(selection) {
	let initialConfiguration = {
		width: 300,
		height: 200,
		data: [],
		colorScale: scaleLinear().range(['green', 'blue']),
		tooltipFormatter: (data) => {
			return `${data.label}: ${data.value}`;
		}
	};

	let width = initialConfiguration.width,
		height = initialConfiguration.height,
		data = initialConfiguration.data,
		colorScale = initialConfiguration.colorScale,
		tooltipFormatter = initialConfiguration.tooltipFormatter;
	let updateData = null;


	function chart(selection) {
		selection.each(function () {
			const barChartSvg = selection.append('svg')
				.attr('height', height)
				.attr('width', width);

			const xScale = scaleBand()
				.domain(data.map(d => d.label))
				.range([0, width])
				.padding(0.1);

			const yScale = scaleLinear()
				.domain([0, max(data, d => d.value)])
				.range([height, 0]);

			colorScale.domain([0, data.length]);

			const tooltip = d3Tip()
				.attr("class", "d3-tip")
				.offset([-8, 0])
				.html(tooltipFormatter);

			barChartSvg.call(tooltip);

			const bars = barChartSvg.append("g")
				.selectAll("rect")
				.data(data);

			bars.enter()
				.append("rect")
				.attr('class', 'bar-area')
				.attr("x", d => xScale(d.label))
				.attr("y", 0)
				.attr("width", xScale.bandwidth())
				.attr("height", d => height)
				.attr("fill", (d, i) => 'lightgrey')
				.on("mouseover", function (d) {
					tooltip.show(d, this);
				})
				.on("mouseout", function () {
					tooltip.hide();
				});

			bars.enter()
				.append("rect")
				.attr('class', 'bar')
				.attr("x", d => xScale(d.label))
				.attr("y", d => yScale(d.value))
				.attr("width", xScale.bandwidth())
				.attr("height", d => height - yScale(d.value))
				.attr("fill", (d, i) => colorScale(i));


			updateData = function () {

				xScale.domain(data.map(d => d.label));
				yScale.domain([0, max(data, d => d.value)]);
				colorScale.domain([0, data.length]);

				const updatedBars = barChartSvg.selectAll('.bar').data(data);
				const updatedBarAreas = barChartSvg.selectAll('.bar-area').data(data);

				updatedBarAreas
					.enter().append("rect")
					.attr('class', 'bar-area')
					.attr("x", d => xScale(d.label))
					.attr("y", 0)
					.attr("width", xScale.bandwidth())
					.attr("height", d => height)
					.attr("fill", (d, i) => 'lightgrey')
					.on("mouseover", function (d) {
						tooltip.show(d, this);
					})
					.on("mouseout", function () {
						tooltip.hide();
					});

				updatedBars
					.enter().append("rect")
					.attr('class', 'bar')
					.attr("x", d => xScale(d.label))
					.attr("y", d => yScale(d.value))
					.attr("width", xScale.bandwidth())
					.attr("height", d => height - yScale(d.value))
					.attr("fill", (d, i) => colorScale(i))
					.on("mouseover", function (d) {
						tooltip.show(d, this);
					})
					.on("mouseout", function () {
						tooltip.hide();
					});

				updatedBarAreas
					.transition()
					.ease(easeLinear)
					.duration(750)
					.attr("x", d => xScale(d.label))
					.attr("y", 0)
					.attr("width", xScale.bandwidth())
					.attr("height", d => height)
					.attr("fill", (d, i) => 'lightgrey');

				updatedBars
					.transition()
					.ease(easeLinear)
					.duration(750)
					.attr("x", d => xScale(d.label))
					.attr("y", d => yScale(d.value))
					.attr("width", xScale.bandwidth())
					.attr("height", d => height - yScale(d.value))
					.attr("fill", (d, i) => colorScale(i));

				updatedBarAreas.exit()
					.transition()
					.ease(easeLinear)
					.duration(100)
					.remove();

				updatedBars.exit()
					.transition()
					.ease(easeLinear)
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
