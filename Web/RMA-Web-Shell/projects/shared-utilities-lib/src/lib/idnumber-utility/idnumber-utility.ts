export class IdNumberUtil {

  getDateFromIdNumber(idNumber: string): any {
    if (idNumber && idNumber.length === 13) {
      let date = new Date(this.getBdayFromSId(idNumber));
      if (this.isValidDate(date)) {
        return date;
      }
      return null;
    }
    return null;
  }

  getBdayFromSId(sid) {
      let year = parseInt(((new Date()).getFullYear()).toString().slice(2, 4));
      let sid_year = parseInt(sid.slice(0, 2));

      if (sid_year > year) {
          sid_year = 1900 + sid_year;
      }
      else {
          sid_year = 2000 + sid_year;
      }

      return sid_year + '-' + sid.slice(2, 4) + '-' + sid.slice(4, 6);
  }


  getGenderFromID(idNumber: string): number {
    if (idNumber && idNumber.length === 13) {
      return (+idNumber[6] < 5) ? 2 : 1
    }
  }

  isValidDate(date: any):boolean {
    return date instanceof Date && !isNaN(Number(date));
  }

  getAge(dateOfBirth: Date): number {
    const today = new Date();
    const dob = new Date(dateOfBirth);
    let age = today.getFullYear() - dob.getFullYear();
    const birthDay = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
    if (birthDay > today) { age--; }
    return age;
  }
}
