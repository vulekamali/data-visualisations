import './stories.styles.css';
import { HorizontalBarChart } from './horizontal-bar-chart';

export default { title: 'Horizontal Bar Chart' };

export const Simple = () => {
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

  const myChart = new HorizontalBarChart()
        .select(container)
        .data(items)
        .nameKey("label_full")
        .reDraw();

  return container;
};
