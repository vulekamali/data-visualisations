import { transition } from 'd3-transition';
import { scaleLinear, scaleTime } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { easeLinear } from 'd3-ease';
import { max, min } from 'd3-array';
import { select } from 'd3-selection';
import { format } from 'd3-format';
import { line } from 'd3-shape';
import d3Tip from 'd3-tip';
import { humaniseRand } from '../../../util';


const margin = {
  top: 50, right: 50, bottom: 80, left: 60,
};
const SYMBOL_WIDTH = 7.5;

function processRawData(data) {
  return data.map((d) => Object.assign(d, {
    date: new Date(d.date),
  }));
}

export function reusableLineChart() {
  const initialConfiguration = {
    width: 850,
    height: 450,
    spentCircleTooltipFormatter: (d) => `<div>\
<span class="tooltip-label">Total spent:</span>&nbsp;&nbsp;\
<span class="tooltip-value">${humaniseRand(d.data.total_spent_to_date)}</span>\
</div>
<div>\
<span class="tooltip-label">Spent in quarter:</span>&nbsp;&nbsp;\
<span class="tooltip-value">${humaniseRand(d.data.total_spent_in_quarter)}</span>\
</div>`,
    totalCostCircleTooltipFormatter: (d) => `<div>\
<span class="tooltip-label">Total project cost:</span>&nbsp;\
<span class="tooltip-value">${humaniseRand(d.data.total_estimated_project_cost)}</span>\
</div>`,
    statusLabelTooltipFormatter: (d) => `<div class="status-tooltip">${d.label}</div>`,
  };

  let { width } = initialConfiguration;
  let { height } = initialConfiguration;
  let data = [];
  const { spentCircleTooltipFormatter } = initialConfiguration;
  const { totalCostCircleTooltipFormatter } = initialConfiguration;
  const { statusLabelTooltipFormatter } = initialConfiguration;
  let updateData = null;
  let correspondingSpentLineCircle; let
    correspondingTotalCostCircle = null;

  function chart(selection) {
    selection.each(() => {
      let xDomainValues = getXDomainValues(data);
      const minimalXDomainValue = min(xDomainValues);
      const newMinXDomainValue = new Date(minimalXDomainValue).setMonth(minimalXDomainValue.getMonth() - 3);
      let yDomainValues = getYDomainValues(data);
      const xScaleLength = width - margin.right - margin.left;
      const yScaleLength = height - margin.bottom - margin.top;

      const xScale = scaleTime()
        .domain([newMinXDomainValue, max(xDomainValues)])
        .range([margin.left, width - margin.right]);

      const yScale = scaleLinear()
        .domain([0, max(yDomainValues)])
        .range([height - margin.bottom, margin.top])
        .nice();

      const svg = selection.append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g');

      const spentCircleTooltip = d3Tip()
        .attr('class', 'd3-tip')
        .direction((d) => d.direction)
        .offset((d) => (d.direction === 'n' ? [-8, 0] : [8, 0]))
        .html(spentCircleTooltipFormatter);

      const totalCostCircleTooltip = d3Tip()
        .attr('class', 'd3-tip')
        .direction((d) => d.direction)
        .offset((d) => (d.direction === 'n' ? [-8, 0] : [8, 0]))
        .html(totalCostCircleTooltipFormatter);

      const statusLabelTooltip = d3Tip()
        .attr('class', 'd3-tip')
        .offset([-8, 0])
        .html(statusLabelTooltipFormatter);

      svg.call(spentCircleTooltip);
      svg.call(totalCostCircleTooltip);
      svg.call(statusLabelTooltip);

      const backgroundRectanglesGroup = svg.append('g')
        .attr('class', 'background-rectangles');

      backgroundRectanglesGroup.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'background-rectangle')
        .attr('x', (datum) => xScale(datum.date) - xScaleLength / data.length)
        .attr('y', yScale.range()[1])
        .attr('width', xScaleLength / data.length)
        .attr('height', () => yScaleLength)
        .attr('fill', 'none')
        .on('mouseover', (d) => {
          showTooltip(d);
        })
        .on('mouseout', () => {
          hideTooltip();
        });

      const statusLineElementsGroup = svg.append('g')
        .attr('class', 'status-line-elements');

      statusLineElementsGroup.selectAll('path')
        .data(getStatusLineData(data))
        .enter()
        .append('path')
        .attr('class', 'status-line-path')
        .attr('d', line()
          .x((d) => (d.start && !d.dotted || d.end && d.dotted ? xScale(d.date) + 20 : xScale(d.date)))
          .y((d) => (d.end && !d.dotted ? 25 : 10)))
        .attr('stroke', 'black')
        .style('stroke-width', 1)
        .style('stroke-dasharray', (d) => (d[0].dotted ? 2 : null))
        .style('fill', 'none');

      statusLineElementsGroup.selectAll('text')
        .data(getStatusLabelsData(data))
        .enter()
        .append('text')
        .attr('class', 'status-line-label')
        .attr('fill', 'black')
        .attr('text-anchor', 'middle')
        .attr('transform', (d) => `translate(${(xScale(d.startDate) + xScale(d.endDate)) / 2 + 10},22)`)
        .text((d) => getStatusLabelText(d))
        .on('mouseover', function (d) {
          if (isStatusLabelTruncated(d)) {
            statusLabelTooltip.show(d, this);
          }
        })
        .on('mouseout', () => {
          statusLabelTooltip.hide();
        });

      const spentLineElementsGroup = svg.append('g')
        .attr('class', 'spent-line-elements');

      spentLineElementsGroup.selectAll('path')
        .data(getTotalSpentLineData(data))
        .enter()
        .append('path')
        .attr('class', 'spent-line-path')
        .attr('d', line()
          .x((d) => xScale(d.date))
          .y((d) => yScale(d.total_spent_to_date)))
        .attr('stroke', 'black')
        .style('stroke-width', 1)
        .style('fill', 'none');

      spentLineElementsGroup.selectAll('circle')
        .data(getTotalSpentCircleData(data))
        .enter()
        .append('circle')
        .attr('class', 'spent-line-circle')
        .attr('cx', (datum) => xScale(datum.date))
        .attr('cy', (datum) => yScale(datum.total_spent_to_date))
        .attr('r', 5)
        .attr('fill', '#333333')
        .on('mouseover', function (d) {
          spentCircleTooltip.show({ data: d, direction: 'n' }, this);
        })
        .on('mouseout', () => {
          spentCircleTooltip.hide();
        });

      const totalCostElementsGroup = svg.append('g')
        .attr('class', 'total-cost-line-elements');

      totalCostElementsGroup.selectAll('path')
        .data(getTotalСostLineData(data))
        .enter()
        .append('path')
        .attr('class', 'total-cost-line-path')
        .attr('d', line()
          .x((d) => xScale(d.date))
          .y((d) => yScale(d.total_estimated_project_cost)))
        .attr('stroke', 'black')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '4 5')
        .style('stroke-miterlimit', 16)
        .style('fill', 'none');

      totalCostElementsGroup.selectAll('circle')
        .data(getTotalСostCircleData(data))
        .enter()
        .append('circle')
        .attr('class', 'total-cost-line-circle')
        .attr('cx', (datum) => xScale(datum.date))
        .attr('cy', (datum) => yScale(datum.total_estimated_project_cost))
        .attr('r', 5)
        .attr('fill', 'none')
        .on('mouseover', function (d) {
          totalCostCircleTooltip.show({ data: d, direction: 'n' }, this);
        })
        .on('mouseout', () => {
          totalCostCircleTooltip.hide();
        });

      const xAxis = axisBottom(xScale)
        .tickValues(xDomainValues)
        .tickFormat('')
        .tickSize(7)
        .tickSizeOuter(0);

      const gXAxis = svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${(height - margin.bottom)})`)
        .call(xAxis);
      applyAxisStyle(gXAxis);

      gXAxis.selectAll('.axis-tick-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'axis-tick-label')
        .attr('fill', 'black')
        .attr('transform', (d) => `translate(${xScale(d.date)},20)`)
        .text((d) => d.quarter_label);

      gXAxis.selectAll('.axis-tick-year-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'axis-tick-year-label')
        .attr('fill', '#bcbcbc')
        .attr('transform', (d) => `translate(${xScale(d.date)},40)`)
        .text((d) => d.financial_year_label);

      const yAxisGrid = axisLeft(yScale)
        .ticks(4)
        .tickFormat('')
        .tickSize(-width + margin.left + margin.right);

      const yAxis = axisLeft(yScale)
        .ticks(4)
        .tickFormat((d) => (d !== 0 ? `${humaniseRand(d, false)}` : ''))
        .tickSizeInner(5)
        .tickSizeOuter(0);

      const gYAxisGrid = svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxisGrid);

      const gYAxis = svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(${margin.left},0)`)
        .call(yAxis);

      applyGridStyle(gYAxisGrid);
      applyAxisStyle(gYAxis, true);

      const legend = svg
        .selectAll('legend')
        .data([
          { label: 'Estimated total project cost', 'stroke-dasharray': '4 5' },
          { label: 'Actual quarterly spend' },
        ])
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${i * 200 + 60},${height - 30})`);

      legend.call(appendLegendItem);


      function appendLegendItem(selection) {
        selection.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 20)
          .attr('height', 20);

        selection.append('line')
          .attr('x1', 0)
          .attr('y1', 10)
          .attr('x2', 20)
          .attr('y2', 10)
          .attr('stroke-dasharray', (d) => (d['stroke-dasharray'] ? d['stroke-dasharray'] : null));

        selection.append('text')
          .attr('x', 25)
          .attr('y', 15)
          .text((d) => d.label)
          .style('text-anchor', 'start');
      }

      function getXDomainValues(data) {
        if (data && data.length > 0) {
          return data.map((group) => new Date(group.date)).sort((a, b) => a - b);
        }
        return [new Date(), new Date()];
      }

      function getYDomainValues(data) {
        return data.map((group) => [group.total_spent_to_date, group.total_estimated_project_cost]).flat()
          .sort((a, b) => a - b);
      }

      function getTotalSpentLineData(data) {
        const result = [];
        if (data && data.length > 0) {
          for (let i = 0; i < data.length - 1; i++) {
            if (data[i].total_spent_to_date && data[i + 1].total_spent_to_date) {
              result.push([data[i], data[i + 1]]);
            }
          }
          return result;
        }
        return [];
      }

      function getStatusLineData(data) {
        const result = [];
        if (data && data.length > 0) {
          const allStatuses = data.filter((d) => !!d.status).map((d) => d.status);
          const uniqueStatuses = [];
          allStatuses.forEach((status) => {
            if (uniqueStatuses.indexOf(status) === -1) {
              uniqueStatuses.push(status);
            }
          });
          uniqueStatuses.forEach((status) => {
            const currentStatusPoints = data.filter((d) => d.status === status);
            result.push([
              {
                date: new Date(currentStatusPoints[0].date).setMonth(currentStatusPoints[0].date.getMonth() - 3),
                dotted: true,
                start: true,
              },
              {
                date: new Date(currentStatusPoints[0].date).setMonth(currentStatusPoints[0].date.getMonth() - 3),
                dotted: true,
                end: true,
              },
            ]);
            result.push([
              {
                date: new Date(currentStatusPoints[0].date).setMonth(currentStatusPoints[0].date.getMonth() - 3),
                start: true,
              },
              {
                date: currentStatusPoints[currentStatusPoints.length - 1].date,
              },
              {
                date: currentStatusPoints[currentStatusPoints.length - 1].date,
                end: true,
              },
            ]);
          });
          return result;
        }
        return [];
      }

      function getStatusLabelsData(data) {
        const result = [];
        if (data && data.length > 0) {
          const allStatuses = data.filter((d) => !!d.status).map((d) => d.status);
          const uniqueStatuses = [];
          allStatuses.forEach((status) => {
            if (uniqueStatuses.indexOf(status) === -1) {
              uniqueStatuses.push(status);
            }
          });
          uniqueStatuses.forEach((status) => {
            const currentStatusPoints = data.filter((d) => d.status === status);
            result.push({
              startDate: new Date(currentStatusPoints[0].date).setMonth(currentStatusPoints[0].date.getMonth() - 3),
              endDate: currentStatusPoints[currentStatusPoints.length - 1].date,
              label: status,
            });
          });
          return result;
        }
        return [];
      }

      function getStatusLabelText(d) {
        const placeholderLength = xScale(d.endDate) - xScale(d.startDate) - 20;
        return placeholderLength > d.label.length * SYMBOL_WIDTH
          ? d.label
          : `${d.label.slice(0, placeholderLength / SYMBOL_WIDTH)}...`;
      }

      function isStatusLabelTruncated(d) {
        return xScale(d.endDate) - xScale(d.startDate) - 20 < d.label.length * SYMBOL_WIDTH;
      }

      function getTotalSpentCircleData(data) {
        return data.filter((d) => d.total_spent_to_date !== null);
      }

      function getTotalСostCircleData(data) {
        return data.filter((d) => d.total_estimated_project_cost !== null);
      }

      function getTotalСostLineData(data) {
        const result = [];
        if (data && data.length > 0) {
          const firstNonNullPointIndex = data.findIndex((d) => d.total_estimated_project_cost !== null);
          const firstPoint = {
            date: xScale.domain()[0],
            total_estimated_project_cost: data[firstNonNullPointIndex].total_estimated_project_cost,
          };
          result.push([firstPoint, data[firstNonNullPointIndex]]);
          for (let i = firstNonNullPointIndex; i < data.length - 1; i++) {
            if (data[i + 1].total_estimated_project_cost !== null) {
              if (data[i + 1].total_estimated_project_cost !== data[i].total_estimated_project_cost) {
                const middlePoint = {
                  date: data[i].date,
                  total_estimated_project_cost: data[i + 1].total_estimated_project_cost,
                };
                result.push([data[i], middlePoint]);
                result.push([middlePoint, data[i + 1]]);
              } else {
                result.push([data[i], data[i + 1]]);
              }
            }
          }
          return result;
        }
        return [];
      }

      function applyAxisStyle(gAxis, yAxis) {
        gAxis.selectAll('line')
          .style('fill', 'none')
          .style('stroke-width', '1')
          .style('stroke', yAxis ? 'black' : 'rgba(0, 0, 0, 0.1)')
          .style('shape-rendering', 'crispEdges');

        gAxis.select('path')
          .style('fill', 'none')
          .style('stroke', 'black')
          .style('stroke-width', '1')
          .style('shape-rendering', 'crispEdges');
        if (yAxis) {
          select(gYAxis.selectAll('.tick').nodes()[0]).attr('visibility', 'hidden');
        }
      }

      function applyGridStyle(gAxis) {
        gAxis.selectAll('line')
          .style('fill', 'none')
          .style('stroke-width', '1')
          .style('stroke', 'rgba(0, 0, 0, 0.1)')
          .style('shape-rendering', 'crispEdges');

        gAxis.select('path')
          .style('fill', 'none')
          .style('color', 'transparent');
      }

      function showTooltip(d) {
        correspondingSpentLineCircle = spentLineElementsGroup.selectAll('circle')
          .filter((circleData) => d.date === circleData.date).nodes()[0];
        correspondingTotalCostCircle = totalCostElementsGroup.selectAll('circle')
          .filter((circleData) => d.date === circleData.date).nodes()[0];

        let totalCostCircleDirection = 'n';
        let spentLineCircleDirection = 'n';
        if (correspondingSpentLineCircle && correspondingTotalCostCircle) {
          const spentLineCircleCY = parseFloat(select(correspondingSpentLineCircle).attr('cy'));
          const totalCostCircle = parseFloat(select(correspondingTotalCostCircle).attr('cy'));
          if (Math.abs(spentLineCircleCY - totalCostCircle) < 50) {
            if (spentLineCircleCY < totalCostCircle) {
              totalCostCircleDirection = 's';
            } else {
              spentLineCircleDirection = 's';
            }
          }
        }

        if (correspondingSpentLineCircle) {
          select(correspondingSpentLineCircle).attr('fill', 'rgb(0, 137, 123)');
          spentCircleTooltip.show({
            data: d,
            direction: spentLineCircleDirection,
          }, correspondingSpentLineCircle);
        }
        if (correspondingTotalCostCircle) {
          select(correspondingTotalCostCircle).attr('fill', 'rgb(0, 137, 123)');
          totalCostCircleTooltip.show({
            data: d,
            direction: totalCostCircleDirection,
          }, correspondingTotalCostCircle);
        }
      }

      function hideTooltip() {
        if (correspondingSpentLineCircle) {
          select(correspondingSpentLineCircle).attr('fill', '#333333');
          spentCircleTooltip.hide();
        }
        if (correspondingTotalCostCircle) {
          totalCostCircleTooltip.hide();
          select(correspondingTotalCostCircle).attr('fill', 'none');
        }
        correspondingSpentLineCircle = null;
        correspondingTotalCostCircle = null;
      }

      updateData = function () {
        xDomainValues = getXDomainValues(data);
        const minimalXDomainValue = min(xDomainValues);
        const newMinXDomainValue = new Date(minimalXDomainValue).setMonth(minimalXDomainValue.getMonth() - 3);

        xScale.domain([newMinXDomainValue, max(xDomainValues)]);
        xAxis.scale(xScale).tickValues(xDomainValues);

        yDomainValues = getYDomainValues(data);
        yScale.domain([0, max(yDomainValues)]).nice();
        yAxis.scale(yScale);
        yAxisGrid.scale(yScale);

        const t = transition()
          .duration(750);

        gXAxis.transition(t)
          .call(xAxis);

        gYAxis.transition(t)
          .call(yAxis);

        gYAxisGrid.transition(t)
          .call(yAxisGrid);

        applyAxisStyle(gXAxis);
        applyAxisStyle(gYAxis, true);
        applyGridStyle(gYAxisGrid);

        const updatedSpentLineCircles = spentLineElementsGroup.selectAll('circle').data(getTotalSpentCircleData(data));
        const updatedTotalCostCircles = totalCostElementsGroup.selectAll('circle').data(getTotalСostCircleData(data));
        const updatedAxisLabels = gXAxis.selectAll('.axis-tick-label').data(data);
        const updatedAxisYearLabels = gXAxis.selectAll('.axis-tick-year-label').data(data);
        const updatedSpentLine = spentLineElementsGroup.selectAll('.spent-line-path').data(getTotalSpentLineData(data));
        const updatedTotalCostLine = totalCostElementsGroup.selectAll('.total-cost-line-path').data(getTotalСostLineData(data));
        const updatedStatusLine = statusLineElementsGroup.selectAll('.status-line-path').data(getStatusLineData(data));
        const updatedStatusLabels = statusLineElementsGroup.selectAll('.status-line-label').data(getStatusLabelsData(data));
        const updatedBackgroundRectangles = backgroundRectanglesGroup.selectAll('.background-rectangle').data(data);

        updatedSpentLine
          .enter()
          .append('path')
          .attr('class', 'spent-line-path')
          .attr('d', line()
            .x((d) => xScale(d.date))
            .y((d) => yScale(d.total_spent_to_date)))
          .attr('stroke', 'black')
          .style('stroke-width', 1)
          .style('fill', 'none');

        updatedSpentLine
          .transition()
          .duration(1000)
          .attr('d', line()
            .x((d) => xScale(d.date))
            .y((d) => yScale(d.total_spent_to_date)));

        updatedSpentLine.exit()
          .transition()
          .ease(easeLinear)
          .duration(100)
          .remove();

        updatedTotalCostLine
          .enter()
          .append('path')
          .attr('class', 'total-cost-line-path')
          .attr('d', line()
            .x((d) => xScale(d.date))
            .y((d) => yScale(d.total_estimated_project_cost)))
          .attr('stroke', 'black')
          .style('stroke-width', 1)
          .style('stroke-dasharray', '4 5')
          .style('stroke-miterlimit', 16)
          .style('fill', 'none');

        updatedTotalCostLine
          .transition()
          .duration(1000)
          .attr('d', line()
            .x((d) => xScale(d.date))
            .y((d) => yScale(d.total_estimated_project_cost)));

        updatedTotalCostLine.exit()
          .transition()
          .ease(easeLinear)
          .duration(100)
          .remove();

        updatedStatusLine
          .enter()
          .append('path')
          .attr('class', 'status-line-path')
          .attr('d', line()
            .x((d) => (d.start && !d.dotted || d.end && d.dotted ? xScale(d.date) + 20 : xScale(d.date)))
            .y((d) => (d.end && !d.dotted ? 25 : 10)))
          .attr('stroke', 'black')
          .style('stroke-width', 1)
          .style('stroke-dasharray', (d) => (d[0].dotted ? 2 : null))
          .style('fill', 'none');

        updatedStatusLine
          .transition()
          .duration(1000)
          .attr('d', line()
            .x((d) => (d.start && !d.dotted || d.end && d.dotted ? xScale(d.date) + 20 : xScale(d.date)))
            .y((d) => (d.end && !d.dotted ? 25 : 10)))
          .style('stroke-dasharray', (d) => (d[0].dotted ? 2 : null));

        updatedStatusLine.exit()
          .transition()
          .ease(easeLinear)
          .duration(100)
          .remove();

        updatedStatusLabels
          .enter()
          .append('text')
          .attr('class', 'status-line-label')
          .attr('fill', 'black')
          .attr('text-anchor', 'middle')
          .attr('transform', (d) => `translate(${(xScale(d.startDate) + xScale(d.endDate)) / 2 + 10},22)`)
          .text((d) => getStatusLabelText(d))
          .on('mouseover', function (d) {
            if (isStatusLabelTruncated(d)) {
              statusLabelTooltip.show(d, this);
            }
          })
          .on('mouseout', () => {
            statusLabelTooltip.hide();
          });

        updatedStatusLabels
          .transition()
          .duration(1000)
          .attr('transform', (d) => `translate(${(xScale(d.startDate) + xScale(d.endDate)) / 2 + 10},22)`)
          .text((d) => getStatusLabelText(d));

        updatedStatusLabels.exit()
          .transition()
          .ease(easeLinear)
          .duration(100)
          .remove();

        updatedSpentLineCircles.enter()
          .append('circle')
          .attr('class', 'spent-line-circle')
          .attr('cx', (datum) => xScale(datum.date))
          .attr('cy', (datum) => yScale(datum.total_spent_to_date))
          .attr('r', 5)
          .attr('fill', '#333333')
          .on('mouseover', function (d) {
            spentCircleTooltip.show({ data: d, direction: 'n' }, this);
          })
          .on('mouseout', () => {
            spentCircleTooltip.hide();
          });

        updatedSpentLineCircles
          .transition()
          .ease(easeLinear)
          .duration(750)
          .attr('cx', (datum) => xScale(datum.date))
          .attr('cy', (datum) => yScale(datum.total_spent_to_date));

        updatedSpentLineCircles.exit()
          .transition()
          .ease(easeLinear)
          .duration(100)
          .remove();

        updatedTotalCostCircles.enter()
          .append('circle')
          .attr('class', 'total-cost-line-circle')
          .attr('cx', (datum) => xScale(datum.date))
          .attr('cy', (datum) => yScale(datum.total_estimated_project_cost))
          .attr('r', 5)
          .attr('fill', 'none')
          .on('mouseover', function (d) {
            totalCostCircleTooltip.show({ data: d, direction: 'n' }, this);
          })
          .on('mouseout', () => {
            totalCostCircleTooltip.hide();
          });

        updatedTotalCostCircles
          .transition()
          .ease(easeLinear)
          .duration(750)
          .attr('cx', (datum) => xScale(datum.date))
          .attr('cy', (datum) => yScale(datum.total_estimated_project_cost));

        updatedTotalCostCircles.exit()
          .transition()
          .ease(easeLinear)
          .duration(100)
          .remove();

        updatedAxisLabels.enter()
          .append('text')
          .attr('class', 'axis-tick-label')
          .attr('fill', 'black')
          .attr('transform', (d) => `translate(${xScale(d.date)},20)`)
          .text((d) => d.quarter_label);

        updatedAxisLabels
          .transition()
          .ease(easeLinear)
          .attr('transform', (d) => `translate(${xScale(d.date)},20)`)
          .duration(750)
          .text((d) => d.quarter_label);

        updatedAxisLabels.exit()
          .transition()
          .ease(easeLinear)
          .duration(100)
          .remove();

        updatedAxisYearLabels.enter()
          .append('text')
          .attr('class', 'axis-tick-year-label')
          .attr('fill', '#bcbcbc')
          .attr('transform', (d) => `translate(${xScale(d.date)},40)`)
          .text((d) => d.financial_year_label);

        updatedAxisYearLabels
          .transition()
          .ease(easeLinear)
          .attr('transform', (d) => `translate(${xScale(d.date)},40)`)
          .duration(750)
          .text((d) => d.financial_year_label);

        updatedAxisYearLabels.exit()
          .transition()
          .ease(easeLinear)
          .duration(100)
          .remove();

        updatedBackgroundRectangles
          .enter()
          .append('rect')
          .attr('class', 'background-rectangle')
          .attr('x', (datum) => xScale(datum.date) - xScaleLength / data.length)
          .attr('y', yScale.range()[1])
          .attr('width', xScaleLength / data.length)
          .attr('height', () => yScaleLength)
          .attr('fill', 'none')
          .on('mouseover', (d) => {
            showTooltip(d);
          })
          .on('mouseout', () => {
            hideTooltip();
          });

        updatedBackgroundRectangles
          .transition()
          .ease(easeLinear)
          .duration(750)
          .attr('x', (datum) => xScale(datum.date) - xScaleLength / data.length)
          .attr('y', yScale.range()[1])
          .attr('width', xScaleLength / data.length)
          .attr('height', () => yScaleLength);

        updatedBackgroundRectangles.exit()
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

  chart.data = function (value) {
    if (!arguments.length) return data;
    data = processRawData(value);
    if (typeof updateData === 'function') updateData();
    return chart;
  };

  return chart;
}
