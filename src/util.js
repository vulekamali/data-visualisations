import { format as d3Format } from 'd3-format';

export const humaniseRand = function (x, longForm) {
  longForm = longForm == undefined ? true : longForm;
  const suffixBillion = longForm == true ? ' billion' : 'bn';
  const suffixMillion = longForm == true ? ' million' : 'm';
  const suffixThousand = longForm == true ? '  thousand' : 'k';

  if (Math.abs(x) >= 1000000000) {
    return formatRand(x / 1000000000) + suffixBillion;
  } if (Math.abs(x) >= 1000000) {
    return formatRand(x / 1000000) + suffixMillion;
  } if (!longForm && Math.abs(x) >= 100000) {
    return formatRand(x / 1000) + suffixThousand;
  }
  return formatRand(x, 0);
};

const formatRand = function (x, decimals) {
  decimals = decimals == undefined ? 1 : decimals;
  return `R ${d3Format(`,.${decimals}f`)(x)}`;
};
