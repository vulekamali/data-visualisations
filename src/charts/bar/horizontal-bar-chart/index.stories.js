import './stories.styles.css';
import { HorizontalBarChart } from './horizontal-bar-chart';

export default { title: 'Horizontal Bar Chart' };

export const Simple = () => {
  const id = "horizontal-bars-simple";

  const items = [
    {
      "label_full": "Gauteng",
      "label_short": "GT",
      "geo_level": "Province",
      "more_url": "/2020-21/departments?province=provincial&sphere=provincial",
      "value": 9123456789,
    },
    {
      "label_full": "Eastern Cape",
      "label_short": "EC",
      "geo_level": "Province",
      "more_url": "/2020-21/departments?province=eastern-cape&sphere=provincial",
      "value": 2123456789,
    }
  ];

  const container = document.createElement('div');
  container.id = id;

  const myChart = new HorizontalBarChart()
        .select(id)
        .data(items)
        .nameKey("label_full")
        .valueKey("value");
  window.setTimeout(function() { console.log("here"); myChart.reDraw() }, 5000);
  return container;
};
