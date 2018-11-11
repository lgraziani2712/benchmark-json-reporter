/* eslint-disable strict */

'use strict';

const fs = require('fs');
const crypto = require('crypto');

const si = require('systeminformation');

const defaultConfig = {
  folder: 'benchmarks',
  callback(result, sysHash, name, folder) {
    const absFolder = `${process.cwd()}/${folder}`;

    if (!fs.existsSync(absFolder)) {
      fs.mkdirSync(absFolder);
    }

    fs.appendFileSync(
      `${absFolder}/${name}-(${sysHash}).log`,
      `${JSON.stringify(result)}\n`,
    );
  },
};

/**
 * This callback process the benchmark results.
 *
 * @callback jsonReportCallback
 * @param {{sysinfo: Object, benchmarks: Array<Object>}} result
 * @param {string} sysHash
 * @param {string} name
 * @param {string} folder
 * @returns {void}
 */
/**
 * Generates an array of objects with the data of every benchmark.
 * By default it writes it to a local json file.
 *
 * @param {Benchmark.Suite} suite The suite to be processed.
 * @param {Object} [rawConfig] The reporter configuration.
 * @param {string} [rawConfig.folder='benchmarks'] The folder to save the files.
 * @param {jsonReportCallback} [rawConfig.callback] The function that process the data.
 * @returns {void}
 */
module.exports = function jsonReporter(suite, rawConfig) {
  const config = {
    ...defaultConfig,
    ...rawConfig,
  };
  const benchmarks = [];

  suite.on('cycle', evt => {
    benchmarks.push(evt.target);
  });
  suite.on('complete', () => {
    Promise.all([si.osInfo(), si.cpu(), si.mem()])
      .then(result => ({
        os: {
          distro: result[0].distro == null ? null : result[0].distro,
          kernel: result[0].kernel == null ? null : result[0].kernel,
          arch: result[0].arch == null ? null : result[0].arch,
          platform: result[0].platform == null ? null : result[0].platform,
          release: result[0].release == null ? null : result[0].release,
        },
        cpu: {
          manufacturer:
            result[1].manufacturer == null ? null : result[1].manufacturer,
          brand: result[1].brand == null ? null : result[1].brand,
          core: result[1].core == null ? null : result[1].core,
          cache: result[1].cache == null ? null : result[1].cache,
          speed: result[1].speed == null ? null : result[1].speed,
        },
        mem: result[2].total == null ? null : result[2].total,
      }))
      .then(sysinfo => {
        const sysHash = crypto
          .createHash('md5')
          .update(JSON.stringify(sysinfo))
          .digest('hex');
        const timestamp = Date.now();
        const result = {
          sysinfo,
          benchmarks: benchmarks.map(bench => {
            if (bench.error) {
              return {
                name: bench.name,
                id: bench.id,
                error: bench.error,
              };
            }

            return {
              name: bench.name,
              id: bench.id,
              stats: bench.stats,
              samples: bench.stats.sample.length,
              deviation: bench.stats.rme.toFixed(2),
              ops: bench.hz.toFixed(bench.hz < 100 ? 2 : 0),
              timestamp,
            };
          }),
        };

        config.callback(result, sysHash, suite.name, config.folder);
      });
  });
};
