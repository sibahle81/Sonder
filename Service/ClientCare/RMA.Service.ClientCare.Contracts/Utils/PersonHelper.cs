using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;

namespace RMA.Service.ClientCare.Contracts.Utils
{
    public static class PersonHelper
    {
        public static string GetIdOrPassport(Person person)
        {
            if (person == null)
            {
                return string.Empty;
            }

            return person.IdType == IdTypeEnum.SAIDDocument
                ? person.IdNumber
                :
                string.IsNullOrEmpty(person.PassportNumber) && !string.IsNullOrEmpty(person.IdNumber)
                    ?
                    person.IdNumber
                    :
                    person.PassportNumber;

        }
    }
}
