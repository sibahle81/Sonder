using Autofac;

using RMA.Common.Constants;
using RMA.Common.Service.Extensions;
using RMA.Service.Admin.RulesManager.Contracts.SDK;
using RMA.Service.ClientCare.RuleTasks.Benefit.MaxDisabledAge;
using RMA.Service.ClientCare.RuleTasks.Benefit.MaximumEntryAge;
using RMA.Service.ClientCare.RuleTasks.Benefit.MaxStudyingAge;
using RMA.Service.ClientCare.RuleTasks.Benefit.MinimumEntryAge;
using RMA.Service.ClientCare.RuleTasks.CapCover;
using RMA.Service.ClientCare.RuleTasks.COID.ApplicableLaw;
using RMA.Service.ClientCare.RuleTasks.COID.AutomaticRenewal;
using RMA.Service.ClientCare.RuleTasks.COID.CancellationOfPolicy;
using RMA.Service.ClientCare.RuleTasks.COID.Currency;
using RMA.Service.ClientCare.RuleTasks.COID.DeathOfEmployee;
using RMA.Service.ClientCare.RuleTasks.COID.EffectOfTermination;
using RMA.Service.ClientCare.RuleTasks.COID.EffectOfTerminationPremium;
using RMA.Service.ClientCare.RuleTasks.COID.FailureProvideInformation;
using RMA.Service.ClientCare.RuleTasks.COID.FuneralCosts;
using RMA.Service.ClientCare.RuleTasks.COID.Interest;
using RMA.Service.ClientCare.RuleTasks.COID.InternationalAccidents;
using RMA.Service.ClientCare.RuleTasks.COID.PayableBenefits;
using RMA.Service.ClientCare.RuleTasks.COID.PremiumCalculation;
using RMA.Service.ClientCare.RuleTasks.COID.PremiumDeposit;
using RMA.Service.ClientCare.RuleTasks.COID.PremiumFinal;
using RMA.Service.ClientCare.RuleTasks.COID.PremiumPayments;
using RMA.Service.ClientCare.RuleTasks.COID.TerminationsOfBenefits;
using RMA.Service.ClientCare.RuleTasks.COID.TermOfPolicy;
using RMA.Service.ClientCare.RuleTasks.COID.TrainingAccidents;
using RMA.Service.ClientCare.RuleTasks.COID.VariationCancellationWaiver;
using RMA.Service.ClientCare.RuleTasks.Funeral.CapCoverMaxIndividual;
using RMA.Service.ClientCare.RuleTasks.MaximumFuneralChildAge;
using RMA.Service.ClientCare.RuleTasks.NumberMainMember;
using RMA.Service.ClientCare.RuleTasks.Product.CapCoverMax05Years;
using RMA.Service.ClientCare.RuleTasks.Product.CapCoverMax13Years;
using RMA.Service.ClientCare.RuleTasks.Product.CapCoverMaxCover;
using RMA.Service.ClientCare.RuleTasks.Product.CapCoverMin13Years;
using RMA.Service.ClientCare.RuleTasks.ProductOption.NumberOfChildren;
using RMA.Service.ClientCare.RuleTasks.ProductOption.NumberOfExtendedMembers;
using RMA.Service.ClientCare.RuleTasks.ProductOption.NumberOfSpouses;
using RMA.Service.ClientCare.RuleTasks.ProductOption.RSACitizensOnly;
using RMA.Service.ClientCare.RuleTasks.ProductOption.TotalCoverAmount;

namespace RMA.Service.ClientCare.RuleTasks
{
    public class ServiceRegistry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            ConsumeTheirServices(builder);

            builder.RegisterType<CapCoverRule>().Named<IRule>(CapCoverRule.RuleName);
            builder.RegisterType<ApplicableLawRule>().Named<IRule>(ApplicableLawRule.RuleName);
            builder.RegisterType<AutomaticRenewalRule>().Named<IRule>(AutomaticRenewalRule.RuleName);
            builder.RegisterType<CancellationOfPolicyRule>().Named<IRule>(CancellationOfPolicyRule.RuleName);
            builder.RegisterType<CurrencyRule>().Named<IRule>(CurrencyRule.RuleName);
            builder.RegisterType<DeathOfEmployeeRule>().Named<IRule>(DeathOfEmployeeRule.RuleName);
            builder.RegisterType<EffectOfTerminationRule>().Named<IRule>(EffectOfTerminationRule.RuleName);
            builder.RegisterType<EffectOfTerminationPremiumRule>().Named<IRule>(EffectOfTerminationPremiumRule.RuleName);
            builder.RegisterType<FailureProvideInformation>().Named<IRule>(FailureProvideInformation.RuleName);
            builder.RegisterType<FuneralCostsRule>().Named<IRule>(FuneralCostsRule.RuleName);
            builder.RegisterType<InterestRule>().Named<IRule>(InterestRule.RuleName);
            builder.RegisterType<InternationalAccidentsRule>().Named<IRule>(InternationalAccidentsRule.RuleName);
            builder.RegisterType<PayableBenefitsRule>().Named<IRule>(PayableBenefitsRule.RuleName);
            builder.RegisterType<PremiumCalculationRule>().Named<IRule>(PremiumCalculationRule.RuleName);
            builder.RegisterType<PremiumDepositRule>().Named<IRule>(PremiumDepositRule.RuleName);
            builder.RegisterType<PremiumFinalRule>().Named<IRule>(PremiumFinalRule.RuleName);
            builder.RegisterType<PremiumPaymentsRule>().Named<IRule>(PremiumPaymentsRule.RuleName);
            builder.RegisterType<TerminationsOfBenefitsRule>().Named<IRule>(TerminationsOfBenefitsRule.RuleName);
            builder.RegisterType<TermOfPolicyRule>().Named<IRule>(TermOfPolicyRule.RuleName);
            builder.RegisterType<TrainingAccidentsRule>().Named<IRule>(TrainingAccidentsRule.RuleName);
            builder.RegisterType<VariationCancellationWaiverRule>().Named<IRule>(VariationCancellationWaiverRule.RuleName);
            builder.RegisterType<ChildAgeLimit>().Named<IRule>(ChildAgeLimit.RuleName);
            builder.RegisterType<NumberOfMainMembers>().Named<IRule>(NumberOfMainMembers.RuleName);

            builder.RegisterType<CapCoverMax05Years>().Named<IRule>(CapCoverMax05Years.RuleName);
            builder.RegisterType<CapCoverMax13Years>().Named<IRule>(CapCoverMax13Years.RuleName);
            builder.RegisterType<CapCoverMin13Years>().Named<IRule>(CapCoverMin13Years.RuleName);
            builder.RegisterType<CapCoverMaxCover>().Named<IRule>(CapCoverMaxCover.RuleName);

            builder.RegisterType<RSACitizensOnly>().Named<IRule>(RSACitizensOnly.RuleName);
            builder.RegisterType<TotalCoverAmount>().Named<IRule>(TotalCoverAmount.RuleName);
            builder.RegisterType<NumberOfSpouses>().Named<IRule>(NumberOfSpouses.RuleName);
            builder.RegisterType<NumberOfChildren>().Named<IRule>(NumberOfChildren.RuleName);
            builder.RegisterType<NumberOfExtendedMembers>().Named<IRule>(NumberOfExtendedMembers.RuleName);

            builder.RegisterType<MinimumEntryAge>().Named<IRule>(MinimumEntryAge.RuleName);
            builder.RegisterType<MaximumEntryAge>().Named<IRule>(MaximumEntryAge.RuleName);
            builder.RegisterType<MaxDisabledAge>().Named<IRule>(MaxDisabledAge.RuleName);
            builder.RegisterType<MaxStudyingAge>().Named<IRule>(MaxStudyingAge.RuleName);

            builder.RegisterType<CapCoverMaxIndividual>().Named<IRule>(CapCoverMaxIndividual.RuleName);
        }

        private static void ConsumeTheirServices(ContainerBuilder builder)
        {
            builder.UseStatelessService<Contracts.Interfaces.Policy.IPolicyCaseService>(AppNames.ClientCare, AppPrefix.Policy);
        }
    }
}
