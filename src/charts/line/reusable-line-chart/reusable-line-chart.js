import 'd3-transition';
import {transition} from 'd3-transition';
import {scaleLinear, scaleTime} from 'd3-scale';
import {axisBottom, axisLeft} from 'd3-axis';
import {easeLinear} from 'd3-ease';
import {max, min} from 'd3-array';
import {format} from 'd3-format';
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

function processRawData(data) {
	return data.map(d => {
		return Object.assign(d, {
			date: new Date(d.date)
		})
	})
}

export function reusableLineChart() {

	let initialConfiguration = {
		width: 1000,
		height: 600,
		spentCircleTooltipFormatter: (d) => {
			return `<span class="tooltip-label">Total spent:</span> &nbsp;&nbsp;<span class="tooltip-value">R${format(",d")(d.total_spent_to_date)}</span></br>
					<span class="tooltip-label">Spent in quarter:</span> &nbsp;&nbsp;<span class="tooltip-value">${d.total_spent_in_quarter ? "R" + format(",d")(d.total_spent_in_quarter) : 0}</span>`;
		}
	};

	let width = initialConfiguration.width,
		height = initialConfiguration.height,
		data = [],
		spentCircleTooltipFormatter = initialConfiguration.spentCircleTooltipFormatter;
	let updateData = null;

	function chart(selection) {
		selection.each(function () {
			let xDomainValues = getXDomainValues(data);
			let minimalXDomainValue = min(xDomainValues);
			let newMinXDomainValue = new Date(minimalXDomainValue).setMonth(minimalXDomainValue.getMonth() - 3);
			let yDomainValues = getYDomainValues(data);
			const xScaleLength = width - margin.right - margin.left;
			const yScaleLength = height - margin.bottom - margin.top;

			const xScale = scaleTime()
				.domain([newMinXDomainValue, max(xDomainValues)])
				.range([margin.left, width - margin.right]);

			const yScale = scaleLinear()
				.domain([0, max(yDomainValues)])
				.range([height - margin.bottom, margin.top]);

			const svg = selection.append("svg")
				.attr("width", width)
				.attr("height", height)
				.append("g");

			const tooltip = d3Tip()
				.attr("class", "d3-tip")
				.offset([-8, 0])
				.html(spentCircleTooltipFormatter);

			svg.call(tooltip);

			const backgroundRectanglesGroup = svg.append("g")
				.attr("class", "background-rectangles");

			backgroundRectanglesGroup.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
				.attr("class", "background-rectangle")
				.attr("x", (datum) => xScale(datum.date) - xScaleLength / data.length)
				.attr("y", yScale.range()[1])
				.attr("width", xScaleLength / data.length)
				.attr("height", () => yScaleLength)
				.attr("fill", 'none')
				.on("mouseover", function (d) {
					const correspondingCircle = spentLineElementsGroup.selectAll('circle')
						.filter(function (circleData) {
							return d.date === circleData.date;
						}).nodes()[0];
					tooltip.show(d, correspondingCircle)
				})
				.on("mouseout", function () {
					tooltip.hide();
				});

			const spentLineElementsGroup = svg.append("g")
				.attr("class", "spent-line-elements");

			spentLineElementsGroup.selectAll("path")
				.data([data])
				.enter()
				.append("path")
				.attr("class", "spent-line-path")
				.attr("d", line()
					.x((d) => xScale(d.date))
					.y((d) => yScale(d.total_spent_to_date))
				)
				.attr("stroke", 'black')
				.style("stroke-width", 2)
				.style("fill", "none");

			spentLineElementsGroup.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
				.attr("class", "spent-line-circle")
				.attr("cx", (datum) => xScale(datum.date))
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
				.tickFormat('')
				.tickSize(7);

			const gXAxis = svg.append("g")
				.attr("class", "x axis")
				.attr("transform", `translate(0,${(height - margin.bottom)})`)
				.call(xAxis);
			applyAxisStyle(gXAxis);

			gXAxis.selectAll('.axis-tick-label')
				.data(data)
				.enter()
				.append("text")
				.attr("class", "axis-tick-label")
				.attr("fill", "black")
				.attr("transform", d => `translate(${xScale(d.date)},20)`)
				.text(d => d.quarter_label);

			gXAxis.selectAll('.axis-tick-year-label')
				.data(data)
				.enter()
				.append("text")
				.attr("class", "axis-tick-year-label")
				.attr("fill", "#bcbcbc")
				.attr("transform", d => `translate(${xScale(d.date)},40)`)
				.text(d => d.financial_year_label);

			const yAxis = axisLeft(yScale)
				.ticks(4)
				.tickFormat(d => d !== 0 ? `R${format('~s')(d)}` : '')
				.tickSize(-width + margin.left + margin.right)
				.tickSizeOuter(5);

			const gYAxis = svg.append("g")
				.attr("class", "y axis")
				.attr("transform", `translate(${margin.left},0)`)
				.call(yAxis);
			applyAxisStyle(gYAxis);

			function getXDomainValues(data) {
				if (data && data.length > 0) {
					return data.map(group => new Date(group.date)).sort((a, b) => a - b);
				} else {
					return [new Date(), new Date()]
				}
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
					.style('stroke', 'black')
					.style('stroke-width', '2')
					.style('shape-rendering', 'crispEdges');
			}

			updateData = function () {
				xDomainValues = getXDomainValues(data);
				let minimalXDomainValue = min(xDomainValues);
				let newMinXDomainValue = new Date(minimalXDomainValue).setMonth(minimalXDomainValue.getMonth() - 3);

				xScale.domain([newMinXDomainValue, max(xDomainValues)]);
				xAxis.scale(xScale).tickValues(xDomainValues);

				yDomainValues = getYDomainValues(data);
				yScale.domain([0, max(yDomainValues)]);
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
				const updatedAxisYearLabels = gXAxis.selectAll('.axis-tick-year-label').data(data);
				const updatedSpentLine = spentLineElementsGroup.selectAll(".spent-line-path").data([data]);
				const updatedBackgroundRectangles = backgroundRectanglesGroup.selectAll(".background-rectangle").data(data);

				updatedSpentLine
					.transition()
					.duration(1000)
					.attr("d", line()
						.x((d) => xScale(d.date))
						.y((d) => yScale(d.total_spent_to_date))
					);

				updatedCircles.enter()
					.append("circle")
					.attr("class", "spent-line-circle")
					.attr("cx", (datum) => xScale(datum.date))
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
					.attr("transform", d => `translate(${xScale(d.date)},20)`)
					.text(d => d.quarter_label);

				updatedAxisLabels
					.transition()
					.ease(easeLinear)
					.attr("transform", d => `translate(${xScale(d.date)},20)`)
					.duration(750)
					.text(d => d.quarter_label);

				updatedAxisLabels.exit()
					.transition()
					.ease(easeLinear)
					.duration(100)
					.remove();

				updatedAxisYearLabels.enter()
					.append("text")
					.attr("class", "axis-tick-year-label")
					.attr("fill", "#bcbcbc")
					.attr("transform", d => `translate(${xScale(d.date)},40)`)
					.text(d => d.financial_year_label);

				updatedAxisYearLabels
					.transition()
					.ease(easeLinear)
					.attr("transform", d => `translate(${xScale(d.date)},40)`)
					.duration(750)
					.text(d => d.financial_year_label);

				updatedAxisYearLabels.exit()
					.transition()
					.ease(easeLinear)
					.duration(100)
					.remove();

				updatedBackgroundRectangles
					.enter()
					.append("rect")
					.attr("class", "background-rectangle")
					.attr("x", (datum) => xScale(datum.date) - xScaleLength / data.length)
					.attr("y", yScale.range()[1])
					.attr("width", xScaleLength / data.length)
					.attr("height", () => yScaleLength)
					.attr("fill", 'none')
					.on("mouseover", function (d) {
						const correspondingCircle = spentLineElementsGroup.selectAll('circle')
							.filter(function (circleData) {
								return d.date === circleData.date;
							}).nodes()[0];
						tooltip.show(d, correspondingCircle)
					})
					.on("mouseout", function () {
						tooltip.hide();
					});

				updatedBackgroundRectangles
					.transition()
					.ease(easeLinear)
					.duration(750)
					.attr("x", (datum) => xScale(datum.date) - xScaleLength / data.length)
					.attr("y", yScale.range()[1])
					.attr("width", xScaleLength / data.length)
					.attr("height", () => yScaleLength);

				updatedBackgroundRectangles.exit()
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
		data = processRawData(value);
		if (typeof updateData === 'function') updateData();
		return chart;
	};

	return chart;
}









