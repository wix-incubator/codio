import Player from '../player/Player';

export function rewind(player: Player, time?: number) {
  if (player) {
    typeof time === 'number' ? player.rewind(time) : player.rewind(10);
  }
}

export function forward(player: Player, time?: number) {
  if (player) {
    typeof time === 'number' ? player.forward(time) : player.forward(10);
  }
}
