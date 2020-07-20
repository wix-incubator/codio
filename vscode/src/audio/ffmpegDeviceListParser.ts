//Heavily based on: https://github.com/syumai/ffmpeg-device-list-parser
const exec = require('child_process').exec;
const platform = process.platform;

function getDeviceList(options: { ffmpegPath?: string } = {}, callback?: Function) {
  if (typeof options === 'function') {
    callback = options;
    options = null;
  }
  const ffmpegPath = options?.ffmpegPath || 'ffmpeg';
  const callbackExists = typeof callback === 'function';

  let inputDevice, prefix, audioSeparator, alternativeName, deviceParams;
  switch (platform) {
    case 'win32':
      inputDevice = 'dshow';
      prefix = /\[dshow/;
      audioSeparator = /DirectShow\saudio\sdevices/;
      alternativeName = /Alternative\sname\s*?\"(.*?)\"/;
      deviceParams = /\"(.*?)\"/;
      break;
    case 'darwin':
      inputDevice = 'avfoundation';
      prefix = /^\[AVFoundation/;
      audioSeparator = /AVFoundation\saudio\sdevices/;
      deviceParams = /^\[AVFoundation.*?\]\s\[(\d*?)\]\s(.*)$/;
      break;
  }

  const searchPrefix = (line) => line.search(prefix) > -1;
  const searchAudioSeparator = (line) => isVideo && line.search(audioSeparator) > -1;
  const searchAlternativeName = (line) => platform === 'win32' && line.search(/Alternative\sname/) > -1;

  const videoDevices = [];
  const audioDevices = [];
  let isVideo = true;

  const execute = (fulfill?: Function) => {
    exec(`${ffmpegPath} -f ${inputDevice} -list_devices true -i ""`, (err, stdout, stderr) => {
      stderr
        .split('\n')
        .filter(searchPrefix)
        .forEach((line) => {
          const deviceList = isVideo ? videoDevices : audioDevices;
          if (searchAudioSeparator(line)) {
            isVideo = false;
            return;
          }
          if (searchAlternativeName(line)) {
            const lastDevice = deviceList[deviceList.length - 1];
            lastDevice.alternativeName = line.match(alternativeName)[1];
            return;
          }
          const params = line.match(deviceParams);
          if (params) {
            let device;
            switch (platform) {
              case 'win32':
                device = {
                  name: params[1],
                };
                break;
              case 'darwin':
                device = {
                  id: parseInt(params[1]),
                  name: params[2],
                };
                break;
            }
            deviceList.push(device);
          }
        });
      const result = { videoDevices, audioDevices };
      if (callbackExists) {
        callback(result);
      } else {
        fulfill(result);
      }
    });
  };

  if (callbackExists) {
    execute();
  } else {
    return new Promise(execute);
  }
}

export { getDeviceList };
