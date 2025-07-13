import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'claimReasonPipe'
})
export class ClaimReasonPipe implements PipeTransform {

  transform(value: string, claimStatusDescription: string): string {
    if (value){
      let status = value.toLowerCase();
       if ((status == "closed" && claimStatusDescription == "Fraudulent Case") 
       || (status == "reopened") ){
         return claimStatusDescription;
       }
       
       return value;
     }  
    
     return claimStatusDescription;
  }
}
