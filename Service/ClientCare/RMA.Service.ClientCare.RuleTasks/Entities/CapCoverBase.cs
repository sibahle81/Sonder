using CommonServiceLocator;

using RMA.Service.Admin.MasterDataManager.Contracts.Enums;
using RMA.Service.ClientCare.Contracts.Entities.RolePlayer;
using RMA.Service.ClientCare.Contracts.Interfaces.Policy;
using RMA.Service.ClientCare.RuleTasks.Entities;

using System;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.RuleTasks.Product
{
    public abstract class CapCoverBase : RuleBase
    {

        protected static int GetPolicyId(Case @case)
        {
            Contract.Requires(@case != null);

            var policyId = 0;
            if (@case.MainMember?.Policies?.Count > 0)
            {
                policyId = @case.MainMember.Policies[0].PolicyId;
            }
            return policyId;
        }

        protected static decimal GetNewCoverAmount(RolePlayer member)
        {
            Contract.Requires(member != null);

            if (member.Person != null && member.Benefits != null && member.Benefits.Count > 0)
            {
                return member.Benefits.Sum(b => b.BenefitRateLatest);
            }
            return 0.00M;
        }

        protected static async Task<decimal> GetCurrentCoverAmount(RolePlayer member, int policyId)
        {
            var policyCaseService = ServiceLocator.Current.GetInstance<IPolicyCaseService>();

            if (policyCaseService != null && member?.Person != null)
            {
                string idNumberPassport;
                switch (member.Person.IdType)
                {
                    case IdTypeEnum.SAIDDocument:
                        idNumberPassport = member.Person.IdNumber;
                        break;
                    case IdTypeEnum.PassportDocument:
                    case IdTypeEnum.Other:
                        idNumberPassport = string.IsNullOrEmpty(member.Person.PassportNumber) ? member.Person.IdNumber : member.Person.PassportNumber;
                        break;
                    case IdTypeEnum.GroupNumber:
                    case IdTypeEnum.RegistrationNumber:
                        idNumberPassport = member.Company != null ? string.IsNullOrEmpty(member.Company.CompanyRegNo) ? member.Person.IdNumber : member.Company.CompanyRegNo : string.Empty;
                        break;
                    default:
                        throw new NullReferenceException("Id Number or Passport Number cannot be null.");
                }
                var amount = await policyCaseService.GetTotalCoverAmount(member.Person.IdType, idNumberPassport, policyId);
                return amount;
            }
            return 0.00M;
        }
    }
}
