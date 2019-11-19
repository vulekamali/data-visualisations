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
    .call(myChart.data(generateData()));

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
  myChart.height(100);
  myChart.width(800);

  button.addEventListener("click", () => {
	  myChart.data(generateData())
  });

  select(chartContainer)
    .call(myChart.data(generateData()));

  return container;
};
