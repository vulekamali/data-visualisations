import './stories.styles.css';
import { select } from 'd3-selection';
import { simpleBarChart } from './simple-bar-chart';

export default { title: 'Simple Bar Chart' };

export function generateData() {
  const items = [];

  for (let i = 0; i < 10; i++) {
    items.push({
      label: String.fromCharCode(65 + i),
      value: Math.random() * 100 + 10,
    });
  }

  return items;
}

export const Simple = () => {
  // create container
  const container = document.createElement("div");
  container.classList.add("container");

  const myChart = simpleBarChart();
  myChart.height(50);
  myChart.width(500);

  select(container)
    .datum(generateData())
    .call(myChart);

  return container;
};
