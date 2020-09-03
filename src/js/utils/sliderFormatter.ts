export default class MyFormatter {
    constructor(private strings: Array<string>) {}

    to(value: number): string {
        value = Math.round(value);
        if (value < 0) {
            value = 0;
        }
        if (value >= this.strings.length) {
            value = this.strings.length - 1;
        }
        return this.strings[value];
    }

    from(value: string): number {
        const result = this.strings && this.strings.indexOf(value);
        return result == -1 ? 0 : result;
    }
}
