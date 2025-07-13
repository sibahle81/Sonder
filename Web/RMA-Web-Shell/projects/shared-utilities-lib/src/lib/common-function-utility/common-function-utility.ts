// Common often used functionality to help clean up code duplication for repeated actions. 
// Helps centralising any bug fixes and additional validations to prevent errors. 
// Verify that the functions matches 100% before replacing the duplicated code with any of these functions.
export class CommonFunctionUtility {

    static ToArray(anyEnum: { [x: string]: any; }) {
        const StringIsNumber = (value: any) => isNaN(Number(value)) === false;
        return Object.keys(anyEnum)
            .filter(StringIsNumber)
            .map(key => anyEnum[key]);
    }

    static formatLookup(lookup: any) {
        if (lookup) {
            return lookup.replace(/([a-z])([A-Z])/g, '$1 $2');
        }
    }

    static formatMoney(value: string): string {
        return value && value != '' ? (value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")) + '.00' : value;
    }

    static formatText(text: string): string {
        if (text) {
            return text.replace(/((?<=[a-z])[A-Z]|[A-Z](?=[a-z]))/g, ' $1').trim();
        }
    }
}