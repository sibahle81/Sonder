interface StringConstructor {
    Empty: string;
    WhiteSpace: string;
    isNullOrEmpty(val: any): boolean;
    isNullOrWhiteSpace(val: any): boolean;
    contains(base: string, val: string): boolean;
    cut(val: string, startIndex: number, endIndex: number): string;
    remove(base: string, val: string): string;
    replaceAll(base: string, val: string, replaceWith: string): string;
    capitalizeFirstLetter(val: string)
}

String.Empty = '';
String.WhiteSpace = ' ';

String.isNullOrEmpty = function (val: any): boolean {
    if (val === undefined || val === null  || val.trim() === String.Empty ) {
        return true;
    }
    return false;
};

String.isNullOrWhiteSpace = function (val: any): boolean {
    if (this.isNullOrEmpty(val) || val === String.WhiteSpace) {
        return true;
    }
    return false;
};

String.contains = function (base: string, val: string): boolean {
    if (this.isNullOrWhiteSpace(base) || this.isNullOrWhiteSpace(val)) {
        return false;
    }

    return base.toLowerCase().indexOf(val.toLowerCase()) !== -1;
};

String.cut = function (val: string, startIndex: number, endIndex: number): string {
    if (this.isNullOrEmpty(val)) {
        return val;
    }

    if (endIndex < startIndex) {
        throw new RangeError('Start of the string to cut should be before the end');
    }

    const start = val.slice(0, startIndex);
    const end = val.slice(endIndex, val.length);

    return start.concat(end);
};

String.remove = function (base: string, val: string): string {
    return base.replace(val, String.Empty);
};

String.replaceAll = function (base: string, val: string, replaceWith: string): string {
    return base.replace(new RegExp(val, 'g'), replaceWith);
};

String.capitalizeFirstLetter = function (val: any): boolean {
  if (this.isNullOrEmpty(val)) {
    return val;
  } else if(val.length == 1) {
    return val.charAt(0).toUpperCase();
  }
  return val.charAt(0).toUpperCase() + val.slice(1);
}
