import { Uri } from 'vscode';
import Player from '../player/Player';
import Recorder from '../recorder/Recorder';
import FSManager from '../filesystem/FSManager';
import playCodio from './playCodio';

export default async function playCodioTask(
  fsManager: FSManager,
  player: Player,
  recorder: Recorder,
  codioUri?: Uri,
  workspaceUri?: Uri,
) {
  //  When a command is executed from 'tasks.json' the first parameter is an array
  //  consisting of the command and project folder.
  if (!codioUri || Array.isArray(codioUri)) {
    const codios = await fsManager.getAllCodiosMetadata();
    codioUri = codios.length === 1 ? codios[0].uri : '';
  }
  playCodio(fsManager, player, recorder, codioUri, workspaceUri);
}
