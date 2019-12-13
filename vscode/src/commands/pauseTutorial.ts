import {showMessage,  MESSAGES} from '../user_interface/messages';
import Player from '../player/Player';

export default function pauseTutorial(player: Player) {
    if (player && player.isPlaying) {
        player.pause();
        showMessage(MESSAGES.tutorialPause);
    } else {
        showMessage(MESSAGES.noActiveTutorial);
    }
}