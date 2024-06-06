const { PerformanceObserver, performance } = require('perf_hooks');

const perf = () => {
  const obs = new PerformanceObserver((items) => {
    const entries = items.getEntries();

    entries.forEach((entry) => {
      console.log(`[${entry.name}] Duration ${(entry.duration / 1000).toFixed(2)}`);
    });
    // performance.clearMarks();
  });

  obs.observe({ entryTypes: ['measure'] });
};

module.exports = perf;
