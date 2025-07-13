export class RegexExpressions {

   public static numericNumberRegEx = '^-?[0-9]\\d*(\\.\\d{1,2})?$';
   public static stringonlyRegex = '[a-zA-Z ]*';
   public static emailRegex = '/^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/';
   public static PhoneNumberRegex = '/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/';
   public static IdNumberRegex = '/^(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/';
   public static postalCodeRegex = '^[0-9]{4}$';
}
