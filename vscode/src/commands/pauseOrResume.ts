import Player from "../player/Player";

export default function pauseOrResume(player: Player) {
    if (player && player.isPlaying) {
        player.pause();
    } else if (player && !player.isPlaying && player.relativeActiveTime > 0) {
        //todo: handle error "time is undefined" when playing throw the player-buttons
        player.resume();
    }
}