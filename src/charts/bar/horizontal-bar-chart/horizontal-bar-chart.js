import { max, ascending, sum } from 'd3-array';
import { select, event } from 'd3-selection';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
import { axisBottom, axisLeft } from 'd3-axis';
import { transition } from 'd3-transition'; // import just to register on selection

/*= =====================================
var options = {
    width: undefined,
    marginLeft: undefined,
    barHeight: 20,
    barSpace: 5,
    groupSpace: 30,
    ticks: 5,
    filterKey: undefined,
    groupKey: undefined,
    nameKey: undefined,
    valuekey: undefined,
    urlkey: undefined,
    filterLabel: "Choose a Filter Item:",
    fontSize: 12,
    fontColor: 'black',
    minValue: 0,
    maxValue: 100,  // default = max(data)
    barUnit: undefined, // 'K' 'M', 'B'
    xAxisUnit: undefined, // 'K' 'M', 'B'
}
======================================= */

// var horizontalBarChart = (selector, data, options) => new HorizontalBarChart(selector, data, options);

export class HorizontalBarChart {
  constructor(selector, data, options) {
    var options = options || {};
    this._selector = selector || undefined;
    this._data = data || undefined;
    this._barHeight = options.barHeight || 20;
    this._barSpace = options.barSpace || 5;
    this._groupSpace = options.groupSpace || 30;
    this._width = options.width || undefined;
    this.__width = this._width;
    this._marginLeft = options.marginLeft || undefined;
    this.margin = {
      top: 0, right: 30, bottom: 30, left: this._marginLeft,
    };
    this._filterLabel = options.filterLabel || 'Choose a Filter Item:';
    this._fontSize = options.fontSize || 12;
    this._fontColor = options.fontColor || 'black';
    this._ticks = options.ticks || 5;
    this._filterKey = options.filterKey || undefined;
    this._groupKey = options.groupKey || undefined;
    this._nameKey = options.nameKey || undefined;
    this._valueKey = options.valueKey || undefined;
    this._urlKey = options.urlKey || undefined;
    this._minValue = options.minValue || 0;
    this._maxValue = options.maxValue;
    if (this._data && this._valueKey) {
      if (!this._maxValue) {
        this._maxValue = 1.5 * max(this._data, (d) => d[this._valueKey]);
      }
      this.sum = this.getSum(this._data, this._valueKey);
    }
    this._barUnit = options.barUnit || undefined;
    this._xAxisUnit = options.xAxisUnit || undefined;
    this.tooltip = select('body').append('div')
      .attr('class', 'toolTip')
      .style('font-size', `${this._fontSize}px`);
    if (this._selector) {
      this.tooltip.attr('id', `${this._selector}-tooltip`);
    }
    this.reDraw();
  }

  reDraw() {
    if (this._selector && this._data && this._nameKey && this._valueKey) {
      // var container = select(this._selector);
      const container = document.getElementById(this._selector);
      if (!this._width) {
        this.__width = container.offsetWidth;
      } else {
        container.style.width = `${this._width}px`;
      }
      if (!this._marginLeft) {
        this.margin.left = parseInt(this.__width / 5);
      }
      container.innerHTML = '';

      if (this._filterKey) {
        var filter_items = this.getFilterItems(this._data, this._filterKey);
        if (filter_items.length > 0) {
          const chart_header_div = document.createElement('div');
          chart_header_div.setAttribute('class', 'chart-header');

          const filter_label = document.createElement('div');
          filter_label.setAttribute('class', 'filter-label');
          filter_label.style.color = this._fontColor;
          filter_label.style.fontSize = `${this._fontSize}px`;

          filter_label.innerHTML = this._filterLabel;
          chart_header_div.append(filter_label);

          const selectElement = document.createElement('select');
          selectElement.setAttribute('class', 'select-list');
          selectElement.style.color = this._fontColor;
          selectElement.style.fontSize = `${this._fontSize}px`;

          filter_items.forEach((item) => {
            const option = document.createElement('option');
            option.value = item;
            option.text = item;
            selectElement.appendChild(option);
          });

          chart_header_div.appendChild(selectElement);
          container.append(chart_header_div);

          selectElement.addEventListener('change', (event) => {
            const filter_value = event.target.value;
            this.drawFilterChart(filter_value);
          });
        }
      }

      const chart_content_div = document.createElement('div');
      chart_content_div.setAttribute('class', 'chart-content');

      container.append(chart_content_div);

      if (filter_items && filter_items.length > 0) {
        this.drawFilterChart(filter_items[0]);
      } else {
        this.drawChart(this._data);
      }
    }
    return this;
  }

  drawFilterChart(filter_value) {
    const filter_data = this._data.filter((item) => item[this._filterKey] == filter_value);
    this.drawChart(filter_data);
  }

  drawChart(chart_data) {
    if (this._groupKey) {
      const group_data = this.getGroupBy(chart_data, this._groupKey);
      const group_keys = Object.keys(group_data);
      if (group_keys.length > 0) {
        this.drawGroupChart(chart_data);
      } else {
        this.drawSingleChart(chart_data);
      }
    } else {
      this.drawSingleChart(chart_data);
    }
  }

  drawGroupChart(chart_data) {
    const group_data = this.getGroupBy(chart_data, this._groupKey);
    const group_keys = Object.keys(group_data);
    group_keys.sort((a, b) => ascending(a, b));
    const group_count = group_keys.length;
    const height = chart_data.length * (this._barHeight + this._barSpace) + group_count * this._groupSpace + 10 + this.margin.top + this.margin.bottom;
    const chart_container = select(`#${this._selector} .chart-content`);
    chart_container.selectAll('*').remove();
    const chart = chart_container.append('svg')
      .style('width', '100%')
      .attr('viewBox', `0 0 ${this.__width} ${height}`);
    const chartWidth = this.__width - this.margin.left;

    let y = 0;
    group_keys.forEach((group_key) => {
      const group_items = group_data[group_key];
      group_items.sort((a, b) => ascending(a[this._nameKey], b[this._nameKey]));
      y += this._groupSpace;

      group_items.forEach((item) => {
        chart.append('rect')
          .attr('class', 'label-bar')
          .attr('fill', '#f8f8f8')
          .attr('height', this._barHeight)
          .attr('width', this.margin.left - 5)
          .attr('x', 0)
          .attr('y', y)
          .attr('rx', 2)
          .attr('rx', 2);

        chart.append('text')
          .attr('class', 'item-label')
          .attr('alignment-baseline', 'middle')
          .attr('x', 5)
          .attr('y', y + this._barHeight / 2)
          .style('fill', this._fontColor)
          .style('font-size', `${this._fontSize}px`)
          .text(item[this._nameKey]);

        y += this._barHeight + this._barSpace;
      });
    });

    /* Chart Background: Under group label, axis and bars; over item labels. */
    chart.append('rect')
      .attr('class', 'chart-background')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .attr('width', `${chartWidth}px`)
      .attr('height', `${height}px`);



    const xScale = scaleLinear()
      .range([0, chartWidth])
      .domain([this._minValue, this._maxValue]);
    // add the x Axis
    const xAxis = chart.append('g')
      .attr('class', 'grid')
      .style('font-size', `${this._fontSize}px`)
      .style('font-weight', 500)
      .attr('transform', `translate(${this.margin.left}, ${height - this.margin.bottom})`)
      .call(axisBottom(xScale)
        .ticks(this._ticks)
        .tickSizeInner([-height])
        .tickSizeOuter([0])
        .tickPadding([10])
        .tickFormat((d) => this.getLabelFormat(d, this._xAxisUnit)));

    y = 0;
    group_keys.forEach((group_key) => {
      const group_items = group_data[group_key];
      group_items.sort((a, b) => ascending(a[this._nameKey], b[this._nameKey]));

      chart.append('text')
        .attr('class', 'item-label')
        .attr('alignment-baseline', 'middle')
        .attr('x', 0)
        .attr('y', y + this._groupSpace / 2)
        .style('font-size', `${this._fontSize}px`)
        .style('fill', this._fontColor)
        .style('font-weight', 'bold')
        .text(group_key);
      y += this._groupSpace;

      group_items.forEach((item) => {
        chart.data([item])
          .append('rect')
          .attr('class', 'bar')
          .attr('fill', (d) => {
            if (typeof d.color === 'undefined') {
              return '#00F';
            } else {
              return d.color;
            }
          })
          .attr('height', this._barHeight)
          .attr('width', 0)
          .attr('x', this.margin.left + 1)
          .attr('y', y)
          .on('mouseover', (d) => this.onMouseOver(d))
          .on('mouseout', (d) => this.tooltip.style('display', 'none'))
          .on('click', (d) => this.onMouseClick(d))
          .transition()
          .duration(500)
          .attr('width', xScale(item[this._valueKey]));

        const percent = item[this._valueKey] / this.sum * 100;
        const bar_text = chart.append('text')
          .attr('class', 'bar-label')
          .attr('alignment-baseline', 'middle')
          .attr('x', this.margin.left + 5)
          .attr('y', y + this._barHeight / 2 + 4)
          .style('fill', this._fontColor)
          .style('font-size', `${this._fontSize}px`)
          .style('font-weight', '500');

        bar_text.append('tspan').text(this.getLabelFormat(item[this._valueKey], this._barUnit));
        bar_text.append('tspan').style('fill', 'lightgray').text(` (${percent.toFixed(2)}%)`);
        bar_text.transition().duration(500).attr('x', xScale(item[this._valueKey]) + this.margin.left + 5);

        y += this._barHeight + this._barSpace;
      });
    });
  }

  drawSingleChart(chart_data) {
    chart_data.sort((a, b) => ascending(a[this._nameKey], b[this._nameKey]));

    const height = chart_data.length * (this._barHeight + this._barSpace) + 10 + this.margin.top + this.margin.bottom;
    const chart_container = select(`#${this._selector} .chart-content`);
    chart_container.selectAll('*').remove();
    const chart = chart_container.append('svg')
      .style('width', '100%')
          .attr('viewBox', `0 0 ${this.__width} ${height}`);
    const chartWidth = this.__width - this.margin.left;
    const xScale = scaleLinear()
      .range([0, chartWidth])
      .domain([this._minValue, this._maxValue]);
    const yScale = scaleBand()
      .range([0, height - 10 - this.margin.top - this.margin.bottom])
      .domain(chart_data.map((d) => d[this._nameKey]));

    chart.selectAll('.label-bar')
      .data(chart_data)
      .enter()
      .append('rect')
      .attr('class', 'label-bar')
      .attr('fill', '#f8f8f8')
      .attr('height', this._barHeight)
      .attr('width', this.margin.left - 5)
      .attr('x', 0)
      .attr('y', (d) => yScale(d[this._nameKey]))
      .attr('rx', 2)
      .attr('rx', 2);

    chart.selectAll('.item-label')
      .data(chart_data)
      .enter()
      .append('text')
      .attr('class', 'item-label')
      .attr('alignment-baseline', 'middle')
      .attr('x', 5)
      .attr('y', (d) => yScale(d[this._nameKey]) + this._barHeight / 2)
      .style('fill', this._fontColor)
      .style('font-size', `${this._fontSize}px`)
      .text((d) => d[this._nameKey]);

    /* Chart Background: Under axis and bars; over item labels. */
    chart.append('rect')
      .attr('class', 'chart-background')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .attr('width', `${chartWidth}px`)
      .attr('height', `${height}px`);

    // add the x Axis
    const xAxis = chart.append('g')
      .attr('class', 'grid')
      .style('font-size', `${this._fontSize}px`)
      .style('font-weight', 500)
      .attr('transform', `translate(${this.margin.left}, ${height - this.margin.bottom})`)
      .call(axisBottom(xScale)
        .ticks(this._ticks)
        .tickSizeInner([-height])
        .tickSizeOuter([0])
        .tickPadding([10])
        .tickFormat((d) => this.getLabelFormat(d, this._xAxisUnit)));

    chart.selectAll('.bar')
      .data(chart_data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('fill', (d) => {
        if (typeof d.color === 'undefined') {
          return '#00F';
        } else {
          return d.color;
        }
      })
      .attr('height', this._barHeight)
    // .attr('width', d => xScale(d[this._valueKey]))
      .attr('x', this.margin.left + 1)
      .attr('y', (d) => yScale(d[this._nameKey]))
      .attr('width', 0)// this is the initial value
      .on('mouseover', (d) => this.onMouseOver(d))
      .on('mouseout', (d) => this.tooltip.style('display', 'none'))
      .on('click', (d) => this.onMouseClick(d))
      .transition()
      .duration(500)
    // .delay((d,i) => i*100)
      .attr('width', (d) => xScale(d[this._valueKey]));

    const bar_text = chart.selectAll('.bar-label')
      .data(chart_data)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('alignment-baseline', 'middle')
      .attr('x', this.margin.left + 5)
      .attr('y', (d) => yScale(d[this._nameKey]) + this._barHeight / 2 + 4)
      .style('fill', this._fontColor)
      .style('font-size', `${this._fontSize}px`)
      .style('font-weight', '500');
    bar_text.append('tspan').text((d) => this.getLabelFormat(d[this._valueKey], this._barUnit));
    bar_text.append('tspan')
      .style('fill', 'lightgray')
      .text((d) => {
        const percent = d[this._valueKey] / this.sum * 100;
        return ` (${percent.toFixed(2)}%)`;
      });
    bar_text.transition().duration(500).attr('x', (d) => xScale(d[this._valueKey]) + this.margin.left + 5);
  }

  getFilterItems(array, key) {
    const result = [];
    array.forEach((element) => {
      if (result.indexOf(element[key]) == -1) {
        result.push(element[key]);
      }
    });
    result.sort((a, b) => ascending(a, b));
    return result;
  }

  getGroupBy(array, key) {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  }

  getSum(data, value_key) {
    return sum(data, (d) => d[value_key]);
  }

  getLabelFormat(value, unit) {
    let result;
    switch (unit) {
      case 'K':
        value /= 1000;
        value = value > 0 ? parseInt(value) : value.toFixed(2);
        result = `R${value}K`;
        break;
      case 'M':
        value /= 1000000;
        value = value > 0 ? parseInt(value) : value.toFixed(2);
        result = `R${value}M`;
        break;
      case 'B':
        value /= 1000000000;
        value = value > 0 ? parseInt(value) : value.toFixed(2);
        result = `R${value}B`;
        break;
      default:
        value = value > 0 ? parseInt(value) : value.toFixed(2);
        result = `R${value}`;
        break;
    }
    if (value < 0.01) {
      return 'R0';
    }
    return result;
  }

  onMouseOver(d) {
    const tooltip_html = ['<table><tbody>'];
    if (this._filterKey) {
      tooltip_html.push(`<tr><td>${this._filterKey}</td><td>${d[this._filterKey]}</td></tr>`);
    }
    if (this._groupKey) {
      tooltip_html.push(`<tr><td>${this._groupKey}</td><td>${d[this._groupKey]}</td></tr>`);
    }
    tooltip_html.push(`<tr><td>${this._nameKey}</td><td>${d[this._nameKey]}</td></tr>`);
    tooltip_html.push(`<tr><td>${this._valueKey}</td><td>${d[this._valueKey]}</td></tr>`);
    tooltip_html.push('</tbody></table>');
    this.tooltip.html(tooltip_html.join(''))
      .style('display', 'inline-block')
      .style('left', `${event.pageX - document.getElementById(`${this._selector}-tooltip`).offsetWidth / 2}px`)
      .style('top', `${event.pageY - document.getElementById(`${this._selector}-tooltip`).offsetHeight - 30}px`);
  }

  onMouseClick(d) {
    if (this._urlKey) {
      if (d[this._urlKey]) {
        window.open(d[this._urlKey], '_blank');
      }
    }
  }

  select(newValue) {
    this._selector = newValue;
    this.tooltip.attr('id', `${this._selector}-tooltip`);
    return this;
  }

  data(newValue) {
    this._data = newValue;
    if (this._data && this._valueKey) {
      if (!this._maxValue) {
        this._maxValue = 1.5 * max(this._data, (d) => d[this._valueKey]);
      }
      this.sum = this.getSum(this._data, this._valueKey);
    }
    return this;
  }

  nameKey(newValue) {
    this._nameKey = newValue;
    return this;
  }

  valueKey(newValue) {
    this._valueKey = newValue;
    if (this._data && this._valueKey) {
      if (!this._maxValue) {
        this._maxValue = 1.5 * max(this._data, (d) => d[this._valueKey]);
      }
      if (!this.sum) {
        this.sum = this.getSum(this._data, this._valueKey);
      }
    }
    return this;
  }

  filterKey(newValue) {
    this._filterKey = newValue;
    return this;
  }

  filterLabel(newValue) {
    this._filterLabel = newValue;
    return this;
  }

  groupKey(newValue) {
    this._groupKey = newValue;
    return this;
  }

  urlKey(newValue) {
    this._urlKey = newValue;
    return this;
  }

  barUnit(newValue) {
    this._barUnit = newValue;
    return this;
  }

  xAxisUnit(newValue) {
    this._xAxisUnit = newValue;
    return this;
  }

  minValue(newValue) {
    this._minValue = newValue;
    return this;
  }

  maxValue(newValue) {
    this._maxValue = newValue;
    return this;
  }

  width(newValue) {
    this._width = newValue;
    this.__width = this._width;
    return this;
  }

  marginLeft(newValue) {
    this._marginLeft = newValue;
    this.margin.left = newValue;
    return this;
  }

  barHeight(newValue) {
    this._barHeight = newValue;
    return this;
  }

  barSpace(newValue) {
    this._barSpace = newValue;
    return this;
  }

  groupSpace(newValue) {
    this._groupSpace = newValue;
    return this;
  }

  ticks(newValue) {
    this._ticks = newValue;
    return this;
  }

  fontSize(newValue) {
    this._fontSize = newValue;
    document.getElementById(`${this._selector}-tooltip`).style.fontSize = `${this._fontSize}px`;
    return this;
  }

  fontColor(newValue) {
    this._fontColor = newValue;
    return this;
  }
}
