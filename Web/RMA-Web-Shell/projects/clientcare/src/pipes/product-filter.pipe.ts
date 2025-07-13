// import { Pipe, PipeTransform } from '@angular/core';

// import { Product } from '../../clientcare/product-manager/models/product';

// @Pipe({
//     name: 'productfilter'
// })
// export class ProductFilterPipe implements PipeTransform {
//     transform(value: Product[], filter: string): Product[] {
//         // filter = '2';
//         let val: any;
//         if (value != null) {
//             val = filter ? value.filter((app: Product) =>
//                 app.coverTypeId != null && app.coverTypeId.toString().indexOf(filter) !== -1
//             ) : value;
//         } else {
//             return null;
//         }
//         return val;
//     }
// }
