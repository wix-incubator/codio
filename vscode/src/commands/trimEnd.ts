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

function trimAudioFileEnd(file: string, end: number) {
  const temporaryFile = addTemporaryExtension(file);

  // ffmpeg does not support editting files in place so we create a temporary copy and then switch the two
  execSync(`ffmpeg -i ${file} -ss 0 -to ${end} ${temporaryFile} -y`);
  fs.unlinkSync(file);
  fs.copyFileSync(temporaryFile, file);
}

export default async function trimEnd(player: Player) {
  console.log(player);
  try {
    const hasFfmpeg = await checkForFfmpeg();

    if (!hasFfmpeg) {
      UI.showMessage(MESSAGES.ffmpegNotAvailable);
      return;
    }

    player.closeCodio();

    const endTimeInSeconds = Math.round(player.relativeActiveTime / SECOND_IN_MS);

    trimAudioFileEnd(player.audioPlayer.audioFilePath, endTimeInSeconds);
  } catch (e) {
    console.log('Trimming file failed', e);
  }
}
