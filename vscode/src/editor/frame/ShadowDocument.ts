import {replaceRange, nthIndex} from '../../utils';

export default class ShadowDocument {
    text: string;

    constructor(text: string) {
        this.text = text;
        return this;
    }

    replaceWithPosition(position, substitute){
        try {
            let start = this.transformPositionToIndex(position, this.text);
            let end = start;
            this.text = replaceRange(this.text, start, end, substitute);
        } catch(e) {
            console.log('replace failed', {position, substitute});
        }
      }

    replaceWithRange(range, substitute){
        try {
            const start = this.transformPositionToIndex(range.start, this.text);
            const end = this.transformPositionToIndex(range.end, this.text);
            this.text = replaceRange(this.text, start, end, substitute);
        } catch(e) {
            console.log('replaceWithRange failed', {range, substitute});
        }
      }

    transformPositionToIndex(position, str) {
        if (position.line !== 0) {
            const startLineIndex = nthIndex(str, '\n', position.line);
            return startLineIndex + position.character + 1;
        } else {
          return position.character;
        }
      }
}

