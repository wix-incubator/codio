import {showMessage,  MESSAGES} from '../user_interface/messages';
import Player from '../player/Player';

export default function pauseCodio(player: Player) {
    if (player && player.isPlaying) {
        player.pause();
        showMessage(MESSAGES.codioPaused);
    } else {
        showMessage(MESSAGES.noActiveCodio);
    }
}