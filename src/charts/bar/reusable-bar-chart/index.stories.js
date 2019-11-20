import './stories.styles.css';
import {select} from 'd3-selection';
import {reusableBarChart} from './reusable-bar-chart';

export default {title: 'Reusable Bar Chart'};

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
    const container = document.createElement("div");
    container.classList.add("container");

    const myChart = reusableBarChart();

    select(container)
        .call(myChart.data(generateData()));

    return container;
};

export const UpdatingData = () => {
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

export const UpdatingColor = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const chartContainer = document.createElement("div");
    chartContainer.classList.add("chartContainer");

    const button = document.createElement("button");
    button.innerHTML = "Update color";

    container.appendChild(chartContainer);
    container.appendChild(button);

    const myChart = reusableBarChart();
    myChart.height(100);
    myChart.width(800);

    button.addEventListener("click", () => {
        myChart.colors(['orange', 'red'])
    });

    select(chartContainer)
        .call(myChart.data(generateData()));

    return container;
};

export const TooltipFormatter = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const myChart = reusableBarChart();
    myChart.height(100);
    myChart.width(800);
    myChart.tooltipFormatter((d) => {
        return `Label: ${d.data.label} </br> Value: ${d.data.value}`;
    });

    select(container)
        .call(myChart.data(generateData()));

    return container;
};

export const UpdatePadding = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const chartContainer = document.createElement("div");
    chartContainer.classList.add("chartContainer");

    const button = document.createElement("button");
    button.innerHTML = "Update padding";

    container.appendChild(chartContainer);
    container.appendChild(button);

    const myChart = reusableBarChart();
    myChart.height(100);
    myChart.width(800);

    select(chartContainer)
        .call(myChart.data(generateData()));

    button.addEventListener("click", () => {
        myChart.padding(10);
    });

    return container;
};
