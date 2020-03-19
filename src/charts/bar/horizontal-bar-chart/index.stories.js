import './stories.styles.css';
import { HorizontalBarChart } from './horizontal-bar-chart';

export default { title: 'Horizontal Bar Chart' };

export const Simple = () => {
  const id = 'horizontal-bars-simple';

  const items = [
    {
      label_full: 'Gauteng',
      label_short: 'GT',
      geo_level: 'Province',
      more_url: '/2020-21/departments?province=provincial&sphere=provincial',
      value: 9123456789,
    },
    {
      label_full: 'Eastern Cape',
      label_short: 'EC',
      geo_level: 'Province',
      more_url: '/2020-21/departments?province=eastern-cape&sphere=provincial',
      value: 2123456789,
    },
  ];

  const container = document.createElement('div');
  container.id = id;

  const myChart = new HorizontalBarChart()
    .select(id)
    .data(items)
    .nameKey('label_full')
    .valueKey('value');

  // hack to draw after returning because dev didn't listen to requirements
  window.setTimeout(() => { console.log('here'); myChart.reDraw(); }, 5000);

  return container;
};

export const GroupedFiltered = () => {
  const id = 'horizontal-bars-grouped';

  const items = [
    {
      label: 'Nelson Mandela Bay',
      code: 'NMA',
      province: 'Eastern Cape',
      geo_level: 'Metropolitain Municipalities',
      more_url: 'https://municipalmoney.gov.za/profiles/municipality-NMA',
      amount: 1123456789,
    },
    {
      label: 'Buffalo City',
      code: 'BUF',
      province: 'Eastern Cape',
      geo_level: 'Metropolitain Municipalities',
      more_url: 'https://municipalmoney.gov.za/profiles/municipality-NMA',
      amount: 3123456789,
    },
    {
      label: 'Sara Baartman',
      code: 'DC10',
      province: 'Eastern Cape',
      geo_level: 'District Municipalities',
      more_url: 'https://municipalmoney.gov.za/profiles/district-DC10',
      amount: 2123456789,
    },
    {
      label: 'Cape Town',
      code: 'CPT',
      province: 'Western Cape',
      geo_level: 'Metropolitain Municipalities',
      more_url: 'https://municipalmoney.gov.za/profiles/municipality-CPT',
      amount: 4123456789,
    },
    {
      label: 'Small cape muni',
      code: 'WC123',
      province: 'Western Cape',
      geo_level: 'Local Municipalities Municipalities',
      more_url: 'https://municipalmoney.gov.za/profiles/municipality-NMA',
      amount: 3123456789,
    },
    {
      label: 'A district',
      code: 'DC20',
      province: 'Western Cape',
      geo_level: 'District Municipalities',
      more_url: 'https://municipalmoney.gov.za/profiles/district-DC20',
      amount: 2123456789,
    },
  ];

  const container = document.createElement('div');
  container.id = id;

  const myChart = new HorizontalBarChart()
    .select(id)
    .data(items)
    .nameKey('label')
    .valueKey('amount')
    .groupKey('geo_level')
    .filterKey('province')
    .colors(['#6E2195'])
    .urlKey('more_url')
    .xAxisUnit('B')
    .barUnit('M');

  // hack to draw after returning because dev didn't listen to requirements
  window.setTimeout(() => { console.log('here'); myChart.reDraw(); }, 5000);

  return container;
};

export const Narrow = () => {
  const id = 'horizontal-bars-narrow';

  const items = [
    {
      label_full: 'Gauteng',
      label_short: 'GT',
      geo_level: 'Province',
      more_url: '/2020-21/departments?province=provincial&sphere=provincial',
      value: 9123456789,
    },
    {
      label_full: 'Eastern Cape',
      label_short: 'EC',
      geo_level: 'Province',
      more_url: '/2020-21/departments?province=eastern-cape&sphere=provincial',
      value: 2123456789,
    },
  ];

  const container = document.createElement('div');
  container.id = id;

  const myChart = new HorizontalBarChart()
    .select(id)
    .data(items)
    .nameKey('label_full')
    .valueKey('value');

  // hack to draw after returning because dev didn't listen to requirements
  window.setTimeout(() => { console.log('here'); myChart.reDraw(); }, 5000);

  return container;
};
