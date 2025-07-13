interface ArrayConstructor {
    isArrayEmpty(val: Array<any>): boolean;
    sortByParameter(val: Array<any>, sortParamer: string, sortOrder?: string): Array<any>;
}

if (!Array.isArrayEmpty) {
    Array.isArrayEmpty = function(val: Array<any>): boolean {
        return (!val || val.length === 0);
    };
}

if(!Array.sortByParameter) {
  Array.sortByParameter = function(val: Array<any>, sortParamer: string, sortOrder?: string) {
    return  sortOrder === 'DESC' ?
      val.slice().sort((a, b) => b[sortParamer] - a[sortParamer]) :
      val.slice().sort((a, b) => a[sortParamer] - b[sortParamer]);
  }
}
