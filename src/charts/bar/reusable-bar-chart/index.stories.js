import './stories.styles.css';
import { select } from 'd3-selection';
import { reusableBarChart } from './reusable-bar-chart';

export default { title: 'Reusable Bar Chart' };

function generateData() {
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
  const chartContainer = document.createElement("div");
  chartContainer.classList.add("chartContainer");

  const myChart = reusableBarChart();

  select(chartContainer)
    .datum(generateData())
    .call(myChart);

  return chartContainer;
};

export const Updating = () => {
  const container = document.createElement("div");
  container.classList.add("container");

  const chartContainer = document.createElement("div");
  chartContainer.classList.add("chartContainer");

  const button = document.createElement("button");
  button.innerHTML = "Update data";

  container.appendChild(chartContainer);
  container.appendChild(button);

  const myChart = reusableBarChart();
  myChart.height(50);
  myChart.width(500);

  button.addEventListener("click", () => {
    select(chartContainer)
      .datum(generateData())
      .call(myChart);
  });

  select(chartContainer)
    .datum(generateData())
    .call(myChart);

  return container;
};