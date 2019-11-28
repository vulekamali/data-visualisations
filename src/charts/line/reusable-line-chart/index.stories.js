import './stories.styles.css';
import {select} from 'd3-selection';
import {reusableLineChart} from './reusable-line-chart';

export default {title: 'Reusable Line Chart'};

const firstData = {
    snapshots: [
        {
            "date": "2018-09-30",
            "quarter_label": "END Q2",
            "financial_year_label": "2018-19",
            "total_spent_to_date": 900000,
            "total_spent_in_quarter": 350000,
            "total_estimated_project_cost": 3200000,
            "status": "Feasibility"
        },
        {
            "date": "2018-12-31",
            "quarter_label": "END Q3",
            "financial_year_label": "",
            "total_spent_to_date": 1669000,
            "total_spent_in_quarter": 689000,
            "total_estimated_project_cost": 3650000,
            "status": "Feasibility"
        },
        {
            "date": "2019-03-31",
            "quarter_label": "END Q4",
            "financial_year_label": "",
            "total_spent_to_date": 1669000,
            "total_spent_in_quarter": 0,
            "total_estimated_project_cost": 3500000,
            "status": "Site Handed - Over to Contractor"
        },
        {
            "date": "2019-06-30",
            "quarter_label": "END Q1",
            "financial_year_label": "2019-20",
            "total_spent_to_date": 2769000,
            "total_spent_in_quarter": 1100000,
            "total_estimated_project_cost": 3650000,
            "status": null
        }
    ],
    events: [
        {
            "date": "2018-07-20",
            "label": "Project Start Date"
        },
        {
            "date": "2018-09-20",
            "label": "Estimated Construction Start Date"
        },
        {
            "date": "2018-10-10",
            "label": "Estimated Project Completion Date"
        },
        {
            "date": "2018-10-30",
            "label": "Contracted Construction End Date"
        },
        {
            "date": "2019-05-15",
            "label": "Estimated Construction End Date"
        }
    ]
};

const secondData = {
    snapshots: [
        {
            "date": "2018-09-30",
            "quarter_label": "END Q2",
            "financial_year_label": "2018-19",
            "total_spent_to_date": 900000,
            "total_spent_in_quarter": 350000,
            "total_estimated_project_cost": 3200000,
            "status": "Feasibility"
        },
        {
            "date": "2018-12-31",
            "quarter_label": "END Q3",
            "financial_year_label": "",
            "total_spent_to_date": null,
            "total_spent_in_quarter": null,
            "total_estimated_project_cost": 3650000,
            "status": "Feasibility"
        },
        {
            "date": "2019-03-31",
            "quarter_label": "END Q4",
            "financial_year_label": "",
            "total_spent_to_date": null,
            "total_spent_in_quarter": null,
            "total_estimated_project_cost": 3500000,
            "status": "Tender"
        },
        {
            "date": "2019-06-30",
            "quarter_label": "END Q1",
            "financial_year_label": "2019-20",
            "total_spent_to_date": 2769000,
            "total_spent_in_quarter": 1100000,
            "total_estimated_project_cost": 3650000,
            "status": "Tender"
        },
        {
            "date": "2019-09-30",
            "quarter_label": "END Q2",
            "financial_year_label": "2019-20",
            "total_spent_to_date": 2769000,
            "total_spent_in_quarter": 0,
            "total_estimated_project_cost": 3650000,
            "status": "Other - Packaged Ongoing Project"
        }
    ],
    events: [
        {
            "date": "2018-07-20",
            "label": "Project Start Date"
        },
        {
            "date": "2018-10-20",
            "label": "Estimated Construction Start Date"
        },
        {
            "date": "2018-12-21",
            "label": "Estimated Project Completion Date"
        },
        {
            "date": "2019-03-19",
            "label": "Contracted Construction End Date"
        },
        {
            "date": "2019-05-15",
            "label": "Estimated Construction End Date"
        }
    ]
};

const thirdData = {
    snapshots: [
        {
            "date": "2018-09-30",
            "quarter_label": "END Q2",
            "financial_year_label": "2018-19",
            "total_spent_to_date": 900000,
            "total_spent_in_quarter": 350000,
            "total_estimated_project_cost": null,
            "status": "Feasibility"
        },
        {
            "date": "2018-12-31",
            "quarter_label": "END Q3",
            "financial_year_label": "",
            "total_spent_to_date": 1669000,
            "total_spent_in_quarter": 689000,
            "total_estimated_project_cost": null,
            "status": "Feasibility"
        },
        {
            "date": "2019-03-31",
            "quarter_label": "END Q4",
            "financial_year_label": "",
            "total_spent_to_date": 1669000,
            "total_spent_in_quarter": 0,
            "total_estimated_project_cost": null,
            "status": null
        },
        {
            "date": "2019-06-30",
            "quarter_label": "END Q1",
            "financial_year_label": "2019-20",
            "total_spent_to_date": 2769000,
            "total_spent_in_quarter": 1100000,
            "total_estimated_project_cost": 3650000,
            "status": "Tender"
        }
    ]
};


const closelyLocatedData = {
    snapshots: [
        {
            "date": "2018-09-30",
            "quarter_label": "END Q2",
            "financial_year_label": "2018-19",
            "total_spent_to_date": 2900000,
            "total_spent_in_quarter": 350000,
            "total_estimated_project_cost": 3200000,
            "status": "Feasibility"
        },
        {
            "date": "2018-12-31",
            "quarter_label": "END Q3",
            "financial_year_label": "",
            "total_spent_to_date": 3640000,
            "total_spent_in_quarter": 689000,
            "total_estimated_project_cost": 3650000,
            "status": "Feasibility"
        },
        {
            "date": "2019-03-31",
            "quarter_label": "END Q4",
            "financial_year_label": "",
            "total_spent_to_date": 4009000,
            "total_spent_in_quarter": 0,
            "total_estimated_project_cost": 3500000,
            "status": "Tender"
        },
        {
            "date": "2019-06-30",
            "quarter_label": "END Q1",
            "financial_year_label": "2019-20",
            "total_spent_to_date": 2769000,
            "total_spent_in_quarter": 1100000,
            "total_estimated_project_cost": 3650000,
            "status": null
        }]
};

const minifiedData = {
    snapshots: [
        {
            "date": "2018-09-30",
            "quarter_label": "END Q2",
            "financial_year_label": "2018-19",
            "total_spent_to_date": 90000,
            "total_spent_in_quarter": 35000,
            "total_estimated_project_cost": 320000,
            "status": "Feasibility"
        },
        {
            "date": "2018-12-31",
            "quarter_label": "END Q3",
            "financial_year_label": "",
            "total_spent_to_date": 166900,
            "total_spent_in_quarter": 68900,
            "total_estimated_project_cost": 365000,
            "status": "Feasibility"
        },
        {

            "date": "2019-03-31",
            "quarter_label": "END Q4",
            "financial_year_label": "",
            "total_spent_to_date": 166900,
            "total_spent_in_quarter": 0,
            "total_estimated_project_cost": 350000,
            "status": "Tender"
        },
        {
            "date": "2019-06-30",
            "quarter_label": "END Q1",
            "financial_year_label": "2019-20",
            "total_spent_to_date": 276900,
            "total_spent_in_quarter": 110000,
            "total_estimated_project_cost": 365000,
            "status": null
        }
    ]
};

export const MockupData = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const myChart = reusableLineChart();

    select(container)
        .call(myChart.data(firstData));

    return container;
};

export const MissingSpentData = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const myChart = reusableLineChart();

    select(container)
        .call(myChart.data(secondData));

    return container;
};


export const MissingCostData = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const myChart = reusableLineChart();

    select(container)
        .call(myChart.data(thirdData));

    return container;
};

export const SinglePointData = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const myChart = reusableLineChart();

    select(container)
        .call(myChart.data({snapshots: [firstData.snapshots[0]]}));

    return container;
};

export const HundredThousandsData = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const myChart = reusableLineChart();

    select(container)
        .call(myChart.data(minifiedData));

    return container;
};

export const SmallWidthHeight = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const myChart = reusableLineChart().width(320).height(450);

    select(container)
        .call(myChart.data(firstData));

    return container;
};


export const CloselyLocatedPointsData = () => {
    const container = document.createElement("div");
    container.classList.add("container");

    const myChart = reusableLineChart();

    select(container)
        .call(myChart.data(closelyLocatedData));

    return container;
};



