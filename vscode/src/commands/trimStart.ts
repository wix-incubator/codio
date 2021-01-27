import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { UI, MESSAGES } from '../user_interface/messages';
import Player from '../player/Player';
import { checkForFfmpeg } from '../utils';

const SECOND_IN_MS = 1000;

function addTemporaryExtension(file): string {
  const directory = path.dirname(file);
  const extension = path.extname(file);
  const cleanFile = path.basename(file, extension);

  return path.join(directory, `${cleanFile}.tmp.${extension}`);
}

function trimAudioFile(file: string, newStartTime: number) {
  const temporaryFile = addTemporaryExtension(file);

  // ffmpeg does not support editting files in place so we create a temporary copy and then switch the two
  execSync(`ffmpeg -i ${file} -ss ${newStartTime} ${temporaryFile} -y`);
  fs.unlinkSync(file);
  fs.copyFileSync(temporaryFile, file);
  fs.unlinkSync(temporaryFile);
}

function trimCodioFile(codioPath: string, newStartTime: number) {
  const jsonPath = path.join(codioPath, 'codio.json');
  const json = require(jsonPath);

  let trimCount = 0;

  for (let i = 0; i < json.events.length; i++) {
    const event = json.events[i];

    event.data.time -= newStartTime;

    if (event.data.time < 0) {
      trimCount++;
    }
  }

  json.events.splice(0, trimCount);
  json.codioLength = newStartTime;

  fs.writeFileSync(jsonPath, JSON.stringify(json), 'utf8');
}

function trimMetaFile(codioPath: string, newStartTime: number) {
  const jsonPath = path.join(codioPath, 'meta.json');
  const json = require(jsonPath);

  json.length -= newStartTime;

  fs.writeFileSync(jsonPath, JSON.stringify(json), 'utf8');
}

export default async function trimStart(player: Player) {
  console.log(player);
  try {
    const hasFfmpeg = await checkForFfmpeg();

    if (!hasFfmpeg) {
      UI.showMessage(MESSAGES.ffmpegNotAvailable);
      return;
    }

    player.closeCodio();

    const newStartTime = player.codioLength - player.relativeActiveTime;
    const newStartTimeInSeconds = Math.round(newStartTime / SECOND_IN_MS);

    trimAudioFile(player.audioPlayer.audioFilePath, newStartTimeInSeconds);
    trimCodioFile(player.codioPath, newStartTime);
    trimMetaFile(player.codioPath, newStartTime);
  } catch (e) {
    console.log('Trimming file failed', e);
  }
}
