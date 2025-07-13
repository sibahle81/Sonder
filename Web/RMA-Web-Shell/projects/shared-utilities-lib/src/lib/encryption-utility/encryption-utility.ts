// THIS NEEDS WORK THERE WAS A PERFORMANCE HIT ON THE JS LIBRARY
//import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'd7b21d53-4f6a-4c5f-9b8c-9a7d6c8e3b67';

export class EncryptionUtility {
  static encryptData(data: string): string {
    return  data; //CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  }

  static decryptData(data: string): string {
    return data;
    // const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
    // return bytes.toString(CryptoJS.enc.Utf8);
  }
}