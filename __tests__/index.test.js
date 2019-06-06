const goproTelemetry = require('../');
const fs = require('fs');

let filename, file, result;

describe('Testing with karma file', () => {
  beforeAll(() => {
    filename = 'karma';
    file = fs.readFileSync(`${__dirname}/../samples/${filename}.raw`);
    result = goproTelemetry({ rawData: file }, { deviceList: true });
  });

  test(`Karma should have two devices`, () => {
    expect(JSON.stringify(result)).toBe('{"1":"Camera","16835857":"GoPro Karma v1.0"}');
  });
});

describe('Testing with hero6+ble.raw file', () => {
  beforeAll(() => {
    filename = 'hero6+ble';
    file = fs.readFileSync(`${__dirname}/../samples/${filename}.raw`);
    result = goproTelemetry({ rawData: file }, { streamList: true });
  });

  test(`hero6+ble.raw should have specific keys`, () => {
    expect(Object.keys(result['1'].streams)).toEqual(['ACCL', 'GYRO', 'GPS5', 'FACE', 'FCNM', 'ISOE', 'SHUT', 'WBAL', 'WRGB']);
  });
});

describe('Testing deeper with hero6+ble file', () => {
  beforeAll(() => {
    filename = 'hero6+ble';
    file = fs.readFileSync(`${__dirname}/../samples/${filename}.raw`);
    result = goproTelemetry({ rawData: file }, { device: 16778241, stream: 'acc1', repeatSticky: true });
  });

  test(`repeatSticky should be working for all samples`, () => {
    expect(JSON.stringify(result['16778241'].streams.acc1.samples[5].MFGI)).toBeDefined();
  });
});

describe('Testing with hero7 file', () => {
  beforeAll(() => {
    filename = 'hero7';
    file = fs.readFileSync(`${__dirname}/../samples/${filename}.raw`);
    result = goproTelemetry({ rawData: file }, { stream: 'ACCL', repeatHeaders: true, groupTimes: 1000 });
  });

  test(`groupTimes should simplify data samples`, () => {
    expect(result['1'].streams.ACCL.samples.length).toBe(18);
  });

  test(`repeatHeaders should describe each value on each sample`, () => {
    expect(result['1'].streams.ACCL.samples[5]['Accelerometer (z) [m/s2]']).toBeDefined();
  });
});

describe('Testing GPS5 with hero7 file', () => {
  beforeAll(() => {
    filename = 'hero7';
    file = fs.readFileSync(`${__dirname}/../samples/${filename}.raw`);
    result = goproTelemetry({ rawData: file }, { stream: 'GPS5', smooth: 20, GPS5Precision: 140 });
  });

  test(`GPS5Precision should leave us with fewer, better samples`, () => {
    expect(result['1'].streams.GPS5.samples.length).toBe(219);
  });

  test(`smooth should return averaged values`, () => {
    expect(result['1'].streams.GPS5.samples[5].value[0]).toBe(42.34258096153846);
  });
});

describe('Testing GPSFix with hero6 file', () => {
  beforeAll(() => {
    filename = 'hero6';
    file = fs.readFileSync(`${__dirname}/../samples/${filename}.raw`);
    result = goproTelemetry({ rawData: file }, { GPS5Fix: 2, timeOut: 'cts' });
  });

  test(`GPS5Fix should discard bad GPS data`, () => {
    expect(result['1'].streams.GPS5).toBeUndefined();
  });

  test(`timeOut:"cts" option should export cts time values`, () => {
    expect(result['1'].streams.FACE.samples[1].cts).toBeDefined();
  });

  test(`timeOut:'cts' option should discard date values`, () => {
    expect(result['1'].streams.FACE.samples[6].date).toBeUndefined();
  });
});

describe('Testing with Fusion file', () => {
  beforeAll(() => {
    filename = 'Fusion';

    const timing = {
      frameDuration: 0.03336666666666666,
      start: new Date('2017-12-31T12:15:25.000Z'),
      samples: [{ cts: 0, duration: 1001 }]
    };

    file = fs.readFileSync(`${__dirname}/../samples/${filename}.raw`);
    result = goproTelemetry({ rawData: file, timing }, { ellipsoid: true, timeIn: 'MP4' });
  });

  test(`ellipsoid option should give bad height (relative to sea level)`, () => {
    expect(result['1'].streams.GPS5.samples[0].value[2]).toBe(-18.524);
  });

  test(`timeIn: 'MP4' option should use mp4 timing dates`, () => {
    expect(result['1'].streams.GYRO.samples[0].date).toEqual(new Date('2017-12-31T12:15:25.000Z'));
  });
});