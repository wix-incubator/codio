import { showMessage, MESSAGES } from "../user_interface/messages";
import Player from "../player/Player";

export default function resumeTutorial(player: Player) {
    if (player && !player.isPlaying && player.tutorialRelativeActiveTime > 0) {
        player.resume();
    } else {
        showMessage(MESSAGES.alreadyPlaying);
    }
}