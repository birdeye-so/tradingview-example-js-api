// Datafeed implementation, will be added later
import Datafeed from './datafeed.js';

window.tvWidget = new TradingView.widget({
	symbol: '8BnEgHoWFysVcuFFX7QztDmzuH8r5ZFvyP3sYwn1XTh6', // default symbol
	interval: '1', // default interval
	fullscreen: true, // displays the chart in the fullscreen mode
	container: 'tv_chart_container',
	datafeed: Datafeed,
	library_path: '../charting_library_cloned_data/charting_library/',
  disabled_features: [
    "popup_hints",
    "header_symbol_search",
    "symbol_search_hot_key",
    "header_compare",
  ],
});
