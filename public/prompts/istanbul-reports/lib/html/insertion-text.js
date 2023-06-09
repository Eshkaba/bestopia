'use strict';
/*
 Copyright 2012-2015, Yahoo Inc.
 Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
function InsertionText(text, consumeBlanks) {
    this.text = text;
    this.origLength = text.length;
    this.offsets = [];
    this.consumeBlanks = consumeBlanks;
    this.startPos = this.findFirstNonBlank();
    this.endPos = this.findLastNonBlank();
}

const WHITE_RE = /[ \f\n\r\t\v\u00A0\u2028\u2029]/;

InsertionText.prototype = {
    findFirstNonBlank() {
        let pos = -1;
        const text = this.text;
        const len = text.length;
        let i;
        for (i = 0; i < len; i += 1) {
            if (!text.charAt(i).match(WHITE_RE)) {
                pos = i;
                break;
            }
        }
        return pos;
    },
    findLastNonBlank() {
        const text = this.text;
        const len = text.length;
        let pos = text.length + 1;
        let i;
        for (i = len - 1; i >= 0; i -= 1) {
            if (!text.charAt(i).match(WHITE_RE)) {
                pos = i;
                break;
            }
        }
        return pos;
    },
    originalLength() {
        return this.origLength;
    },

    insertAt(col, str, insertBefore, consumeBlanks) {
        consumeBlanks =
            typeof consumeBlanks === 'undefined'
                ? this.consumeBlanks
                : consumeBlanks;
        col = col > this.originalLength() ? this.originalLength() : col;
        col = col < 0 ? 0 : col;

        if (consumeBlanks) {
            if (col <= this.startPos) {
                col = 0;
            }
            if (col > this.endPos) {
                col = this.origLength;
            }
        }

        const len = str.length;
        const offset = this.findOffset(col, len, insertBefore);
        const realPos = col + offset;
        const text = this.text;
        this.text = text.substring(0, realPos) + str + text.substring(realPos);
        return this;
    },

    findOffset(pos, len, insertBefore) {
        const offsets = this.offsets;
        let offsetObj;
        let cumulativeOffset = 0;
        let i;

        for (i = 0; i < offsets.length; i += 1) {
            offsetObj = offsets[i];
            if (
                offsetObj.pos < pos ||
                (offsetObj.pos === pos && !insertBefore)
            ) {
                cumulativeOffset += offsetObj.len;
            }
            if (offsetObj.pos >= pos) {
                break;
            }
        }
        if (offsetObj && offsetObj.pos === pos) {
            offsetObj.len += len;
        } else {
            offsets.splice(i, 0, { pos, len });
        }
        return cumulativeOffset;
    },

    wrap(startPos, startText, endPos, endText, consumeBlanks) {
        this.insertAt(startPos, startText, true, consumeBlanks);
        this.insertAt(endPos, endText, false, consumeBlanks);
        return this;
    },

    wrapLine(startText, endText) {
        this.wrap(0, startText, this.originalLength(), endText);
    },

    toString() {
        return this.text;
    }
};

module.exports = InsertionText;
