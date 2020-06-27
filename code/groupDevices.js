const { ignore } = require('./data/keys');
const promisify = require('./utils/promisify');

//Groups DEVC entries by device
async function groupDevices(klv) {
  result = {};
  for (const d of klv.DEVC) {
    await promisify(() => {
      //Delete TICK and potentially other unused keys
      ignore.forEach(i => {
        if (d.hasOwnProperty(i)) delete d[i];
      });
      //Save to results inside device id key
      if (result[d.DVID]) result[d.DVID].DEVC.push(d);
      else result[d.DVID] = { DEVC: [d], interpretSamples: 'DEVC' };
    });
  }
  return result;
}

module.exports = groupDevices;
