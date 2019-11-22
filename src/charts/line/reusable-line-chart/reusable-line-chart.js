import 'd3-transition';
import {scaleLinear, scaleTime} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {max, min} from 'd3-array';
import {formatPrefix} from 'd3-format';
import {line} from 'd3-shape';
import d3Tip from "d3-tip";

const margin = {top: 50, right: 50, bottom: 50, left: 100};

Object.defineProperty(Array.prototype, 'flat', {
	value: function (depth = 1) {
		return this.reduce(function (flat, toFlatten) {
			return flat.concat((Array.isArray(toFlatten) && (depth - 1)) ? toFlatten.flat(depth - 1) : toFlatten);
		}, []);
	}
});

export function reusableLineChart(selection) {

	let initialConfiguration = {
		width: 1000,
		height: 600,
		tooltipFormatter: (d) => {
			return `Tooltip!`;
		}
	};

	let width = initialConfiguration.width,
		height = initialConfiguration.height,
		data = [],
		tooltipFormatter = initialConfiguration.tooltipFormatter;
	let updateData = null;

	function chart(selection) {
		selection.each(function () {
			let xDomainValues = getXDomainValues(data);
			let yDomainValues = getYDomainValues(data);

			const xScale = scaleTime()
				.domain([
					min(xDomainValues),
					max(xDomainValues)
				])
				.range([margin.left, width - margin.right]);

			const yScale = scaleLinear()
				.domain([
					0,
					max(yDomainValues)
				])
				.range([height - margin.bottom, margin.top]);

			const svg = selection.append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g");

			const tooltip = d3Tip()
				.attr("class", "d3-tip")
				.offset([-8, 0])
				.html(tooltipFormatter);

			svg.call(tooltip);

			const spentLineElementsGroup = svg.append("g")
				.attr("class", "spent-line-elements");

			spentLineElementsGroup
				.append("path")
				.datum(data)
				.attr("class", "spent-line-path")
				.attr("d", line()
					.x((d) => xScale(new Date(d.date)))
					.y((d) => yScale(new Date(d.total_spent_to_date)))
				)
				.attr("stroke", 'black')
				.style("stroke-width", 2)
				.style("fill", "none");

			spentLineElementsGroup.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("class", "spent-line-circle")
				.attr("cx", (datum) => xScale(new Date(datum.date)))
				.attr("cy", (datum) => yScale(datum.total_spent_to_date))
				.attr("r", 6)
				.attr("fill", '#333333')
				.on("mouseover", function (d) {
					tooltip.show(d, this);
				})
				.on("mouseout", function () {
					tooltip.hide();
				});


			const xAxis = axisBottom(xScale)
				.tickValues(xDomainValues)
				.tickFormat(d => '')
				.tickSize(5);

			const gXAxis = svg.append("g")
				.attr("class", "x axis")
				.attr("transform", `translate(0,${(height - margin.bottom)})`)
				.call(xAxis);
			applyAxisStyle(gXAxis);

			gXAxis.append('g')
				.selectAll('.axis-tick-label')
				.data(data)
				.enter()
				.append("text")
				.attr("class", "axis-tick-label")
				.attr("fill", "black")
				.attr("transform", d => `translate(${xScale(new Date(d.date))},20)`)
				.text(d => d.quarter_label);

			gXAxis.append('g')
				.selectAll('.axis-tick-year-label')
				.data(data)
				.enter()
				.append("text")
				.attr("class", "axis-tick-year-label")
				.attr("fill", "#bcbcbc")
				.attr("transform", d => `translate(${xScale(new Date(d.date))},40)`)
				.text(d => d.financial_year_label);

			const yAxis = axisLeft(yScale)
				.ticks(4)
				.tickFormat(d => d !== 0 ? `R${formatPrefix(".1", 1e6)(d)}` : '')
				.tickSize(-width + margin.left + margin.right)
				.tickSizeOuter(5);

			const gYAxis = svg.append("g")
				.attr("class", "y axis")
				.attr("transform", `translate(${margin.left},0)`)
				.call(yAxis);
			applyAxisStyle(gYAxis);

			function getXDomainValues(data) {
				return data.map(group => new Date(group.date)).sort((a, b) => a - b);
			}

			function getYDomainValues(data) {
				return data.map(group => [group.total_spent_to_date, group.total_estimated_project_cost]).flat()
					.sort((a, b) => a - b);
			}

			function applyAxisStyle(gAxis) {
				gAxis.selectAll('line')
					.style('fill', 'none')
					.style('stroke', 'rgba(0, 0, 0, 0.1)')
					.style('shape-rendering', 'crispEdges');

				gAxis.select('path')
					.style('fill', 'none')
					.style('stroke', 'rgba(0, 0, 0, 0.1)')
					.style('shape-rendering', 'crispEdges');
			}

			updateData = function () {
				xDomainValues = getXDomainValues(data);

				xScale.domain(getXDomainValues(data));
				xAxis.scale(xScale);

				yDomainValues = getYDomainValues(data);
				yScale.domain([
					0,
					max(yDomainValues)
				]);
				yAxis.scale(yScale);

				const t = transition()
					.duration(750);

				gXAxis.transition(t)
					.call(xAxis);

				gYAxis.transition(t)
					.call(yAxis);

				applyAxisStyle(gXAxis);
				applyAxisStyle(gYAxis);

				const updatedCircles = spentLineElementsGroup.selectAll('circle').data(data);
				const updatedAxisLabels = gXAxis.selectAll('.axis-tick-label').data(data);
				const updatedSpentLine = spentLineElementsGroup.select(".spent-line-path").data(data);

				updatedSpentLine
					.transition()
					.duration(1000)
					.attr("d", line()
						.x((d) => xScale(new Date(d.date)))
						.y((d) => yScale(new Date(d.total_spent_to_date)))
					);

				updatedCircles.enter()
					.append("circle")
					.attr("class", "spent-line-circle")
					.attr("cx", (datum) => xScale(new Date(datum.date)))
					.attr("cy", (datum) => yScale(datum.total_spent_to_date))
					.attr("r", 6)
					.attr("fill", '#333333')
					.on("mouseover", function (d) {
						tooltip.show(d, this);
					})
					.on("mouseout", function () {
						tooltip.hide();
					});

				updatedCircles
					.transition()
					.ease(easeLinear)
					.duration(750)
					.attr("cx", (datum) => xScale(datum.date))
					.attr("cy", (datum) => yScale(datum.total_spent_to_date));

				updatedCircles.exit()
					.transition()
					.ease(easeLinear)
					.duration(100)
					.remove();

				updatedAxisLabels.enter()
					.append("text")
					.attr("class", "axis-tick-label")
					.attr("fill", "black")
					.attr("transform", d => `translate(${xScale(new Date(d.date))},20)`)
					.text(d => d.quarter_label);

				updatedAxisLabels
					.transition()
					.ease(easeLinear)
					.attr("transform", d => `translate(${xScale(new Date(d.date))},20)`)
					.duration(750)
					.text(d => d.quarter_label);

				updatedAxisLabels.exit()
					.transition()
					.ease(easeLinear)
					.duration(100)
					.remove();
			};

		})
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

	chart.data = function (value) {
		if (!arguments.length) return data;
		data = value;
		if (typeof updateData === 'function') updateData();
		return chart;
	};

	return chart;
}








