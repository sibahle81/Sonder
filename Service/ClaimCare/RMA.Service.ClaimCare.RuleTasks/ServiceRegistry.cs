using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.MasterDataManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.Interfaces;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClaimCare.RuleTasks.ClaimReOpening;
using RMA.Service.ClaimCare.RuleTasks.Funeral.ChildCapCover;
using RMA.Service.ClaimCare.RuleTasks.Funeral.ExtendedFamily;
using RMA.Service.ClaimCare.RuleTasks.Funeral.GroupFuneralAge;
using RMA.Service.ClaimCare.RuleTasks.Funeral.NumberOfChildren;
using RMA.Service.ClaimCare.RuleTasks.Funeral.RmaFuneralAge;
using RMA.Service.ClaimCare.RuleTasks.Funeral.VoluntaryFuneralAge;
using RMA.Service.ClaimCare.RuleTasks.Funeral.VoluntaryFuneralAgeOptionFour;
using RMA.Service.ClaimCare.RuleTasks.MedicalInvoice.ICD10Code;
using RMA.Service.ClaimCare.RuleTasks.MedicalInvoice.MedicalBenefit;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaim;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimBenefitsWithinTwoYears;
using RMA.Service.ClaimCare.RuleTasks.PreAuthClaimNotOlderThanTwoYears;
using RMA.Service.ClaimCare.RuleTasks.STP.ClaimStatusPended;
using RMA.Service.ClaimCare.RuleTasks.STP.ClaimType;
using RMA.Service.ClaimCare.RuleTasks.STP.DaysBookedOffFromWork;
using RMA.Service.ClaimCare.RuleTasks.STP.EventCategory;
using RMA.Service.ClaimCare.RuleTasks.STP.EventDate;
using RMA.Service.ClaimCare.RuleTasks.STP.FirstMedicalReport;
using RMA.Service.ClaimCare.RuleTasks.STP.IDorPassport;
using RMA.Service.ClaimCare.RuleTasks.STP.InsuranceType;
using RMA.Service.ClaimCare.RuleTasks.STP.LiabilityDecisionOutstandingRequirements;
using RMA.Service.ClaimCare.RuleTasks.STP.MemberStatus;
using RMA.Service.ClaimCare.RuleTasks.STP.MultipleDaysBookedOffFromWork;
using RMA.Service.ClaimCare.RuleTasks.STP.MultipleFirstMedicalReport;
using RMA.Service.ClaimCare.RuleTasks.STP.PDPercentage;
using RMA.Service.ClaimCare.RuleTasks.STP.PossibleBenefitsDue;
using RMA.Service.ClaimCare.RuleTasks.STP.STPMedicalCostsCaps;
using RMA.Service.ClaimCare.RuleTasks.STP.VerifyNumberofWorkingDaysPassed;
using RMA.Service.MediCare.Contracts.Interfaces.Medical;

using Rules.ClaimsCare.MultipleSTPMedicalCostsCaps;

namespace RMA.Service.ClaimCare.RuleTasks
{
    public class ServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            ConsumeTheirServices(builder);
            builder.RegisterType<ChildCapCoverLimit>().Named<IRule>(ChildCapCoverLimit.RuleName);
            builder.RegisterType<NumberOfExtendedMembers>().Named<IRule>(NumberOfExtendedMembers.RuleName);
            builder.RegisterType<GroupFuneralAgeRule>().Named<IRule>(GroupFuneralAgeRule.RuleName);
            builder.RegisterType<NumberOfChildren>().Named<IRule>(NumberOfChildren.RuleName);
            builder.RegisterType<RmaFuneralAgeRule>().Named<IRule>(RmaFuneralAgeRule.RuleName);
            builder.RegisterType<VoluntaryFuneralAgeRule>().Named<IRule>(VoluntaryFuneralAgeRule.RuleName);
            builder.RegisterType<VoluntaryFuneralAgeOptionFourRule>().Named<IRule>(VoluntaryFuneralAgeOptionFourRule.RuleName);
            builder.RegisterType<ClaimStatusPendedRule>().Named<IRule>(ClaimStatusPendedRule.RuleName);
            builder.RegisterType<ClaimTypeRule>().Named<IRule>(ClaimTypeRule.RuleName);
            builder.RegisterType<DaysBookedOffFromWorkRule>().Named<IRule>(DaysBookedOffFromWorkRule.RuleName);
            builder.RegisterType<EventCategoryRule>().Named<IRule>(EventCategoryRule.RuleName);
            builder.RegisterType<EventDateRule>().Named<IRule>(EventDateRule.RuleName);
            builder.RegisterType<FirstMedicalReportRule>().Named<IRule>(FirstMedicalReportRule.RuleName);
            builder.RegisterType<IDorPassportRule>().Named<IRule>(IDorPassportRule.RuleName);
            builder.RegisterType<InsuranceTypeRule>().Named<IRule>(InsuranceTypeRule.RuleName);
            builder.RegisterType<LiabilityDecisionOutstandingRequirementsRule>().Named<IRule>(LiabilityDecisionOutstandingRequirementsRule.RuleName);
            builder.RegisterType<MemberStatusRule>().Named<IRule>(MemberStatusRule.RuleName);
            builder.RegisterType<PDPercentageRule>().Named<IRule>(PDPercentageRule.RuleName);
            builder.RegisterType<PossibleBenefitsDueRule>().Named<IRule>(PossibleBenefitsDueRule.RuleName);
            builder.RegisterType<STPMedicalCostsCapsRule>().Named<IRule>(STPMedicalCostsCapsRule.RuleName);
            builder.RegisterType<VerifyNumberofWorkingDaysPassedRule>().Named<IRule>(VerifyNumberofWorkingDaysPassedRule.RuleName);
            builder.RegisterType<MultipleSTPMedicalCostsCapsRule>().As<IRule>().Named<IRule>(MultipleSTPMedicalCostsCapsRule.RuleName);
            builder.RegisterType<MultipleFirstMedicalReportRule>().As<IRule>().Named<IRule>(MultipleFirstMedicalReportRule.RuleName);
            builder.RegisterType<MultipleDaysBookedOffFromWorkRule>().As<IRule>().Named<IRule>(MultipleDaysBookedOffFromWorkRule.RuleName);
            builder.RegisterType<ClaimLiabilityStatusRule>().As<IRule>().Named<IRule>(ClaimLiabilityStatusRule.RuleName);
            builder.RegisterType<ClaimNotOlderThanTwoYearsRule>().As<IRule>().Named<IRule>(ClaimNotOlderThanTwoYearsRule.RuleName);
            builder.RegisterType<PreAuthClaimBenefitsWithinTwoYearsRule>().As<IRule>().Named<IRule>(PreAuthClaimBenefitsWithinTwoYearsRule.RuleName);
            builder.RegisterType<ClaimReOpeningRule>().As<IRule>().Named<IRule>(ClaimReOpeningRule.RuleName);
            builder.RegisterType<MedicalInvoice.ClaimLiabilityStatus.ClaimLiabilityStatusRule>().As<IRule>().Named<IRule>(MedicalInvoice.ClaimLiabilityStatus.ClaimLiabilityStatusRule.RuleName);
            builder.RegisterType<ICD10CodeRule>().As<IRule>().Named<IRule>(ICD10CodeRule.RuleName);
            builder.RegisterType<MedicalBenefitRule>().As<IRule>().Named<IRule>(MedicalBenefitRule.RuleName);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<IPublicHolidayService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IRuleService>(AppNames.Admin, AppPrefix.RulesManager);
            builder.UseStatelessService<IPublicHolidayService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IConfigurationService>(AppNames.Admin, AppPrefix.MasterDataManager);
            builder.UseStatelessService<IPreAuthorisationService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IHealthCareProviderService>(AppNames.MediCare, AppPrefix.Medical);
            builder.UseStatelessService<IICD10CodeService>(AppNames.MediCare, AppPrefix.Medical);
        }
    }
}
