import { UI, MESSAGES } from '../user_interface/messages';
import Player from '../player/Player';

export default function pauseCodio(player: Player) {
  if (player && player.isPlaying) {
    player.pause();
  } else {
    UI.showMessage(MESSAGES.noActiveCodio);
  }
}
