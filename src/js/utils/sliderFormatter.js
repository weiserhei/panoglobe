export default class MyFormatter {
    constructor(strings) {
        this.strings = strings;
        // this.strings = [
        //     "abc",
        //     "z",
        // ];
        this.to = function (number) {
            let value = Math.round(number);
            if (value < 0) {
                value = 0;
            }
            if (value >= this.strings.length) {
                value = this.strings.length - 1;
            }
            return this.strings[value];
        };
        this.from = function (value) {
            let result = this.strings.indexOf(value);
            return result == -1 ? 0 : result;
        };
    }
}
