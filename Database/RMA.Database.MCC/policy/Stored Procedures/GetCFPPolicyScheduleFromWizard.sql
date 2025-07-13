

CREATE   PROCEDURE [policy].[GetCFPPolicyScheduleFromWizard] (@wizardId int)
as begin

--declare @wizardId int = 45765

set nocount on

declare @mainMember varchar(max)
declare @policy varchar(max)
declare @benefit varchar(max)
declare @spouse varchar(max)
declare @children varchar(max)
declare @family varchar(max)

declare @multiplier int

select @mainMember = iif(json_query([Data], '$[0].newMainMember') is null, 
		json_query([Data], '$[0].mainMember'), 
		json_query([Data], '$[0].newMainMember')),
	@policy = json_query([Data], '$[0].mainMember.policies[0]'),
	@benefit = iif(json_query([Data], '$[0].newMainMember') is null, 
		json_query([Data], '$[0].mainMember.benefits[0]'), 
		json_query([Data], '$[0].newMainMember.benefits[0]')),
	@spouse = json_query([Data], '$[0].spouse'),
	@children = json_query([Data], '$[0].children'),
	@family = json_query([Data], '$[0].extendedFamily')
from [bpm].[Wizard]  where [Id] = @wizardId

select @multiplier = case json_value(@policy, '$.paymentFrequency')
	when '1' then 12
	when '2' then 1
	when '3' then 3
	when '4' then 6
	else 0
end

declare @rate table (
	IsDeleted bit,
	Premium money
)

insert into @rate select IsDeleted, isnull(Premium, 0.00) from openjson(@mainMember) with (IsDeleted bit '$.isDeleted', Premium float '$.benefits[0].benefitBaseRateLatest')
insert into @rate select IsDeleted, isnull(Premium, 0.00) from openjson(@spouse) with (IsDeleted bit '$.isDeleted', Premium float '$.benefits[0].benefitBaseRateLatest')
insert into @rate select IsDeleted, isnull(Premium, 0.00) from openjson(@children) with (IsDeleted bit '$.isDeleted', Premium float '$.benefits[0].benefitBaseRateLatest')
insert into @rate select IsDeleted, isnull(Premium, 0.00) from openjson(@family) with (IsDeleted bit '$.isDeleted', Premium float '$.benefits[0].benefitBaseRateLatest')

declare @premium money
select @premium = sum(Premium) from @rate where IsDeleted = 0

select json_value(@policy, '$.brokerageId') [BrokerId],
	json_value(@policy, '$.policyBrokers[0].brokerage.name') [Brokerage],
	json_value(@policy, '$.representativeId') [RepresentativeId],
	json_value(@policy, '$.policyBrokers[0].rep.name') [Representative],
	json_value(@mainMember, '$.displayName') [MainMemberName],
	case json_value(@mainMember, '$.person.idType')
		when '1' then json_value(@mainMember, '$.person.idNumber')
		else          json_value(@mainMember, '$.person.passportNumber')
	end [MainMemberIdNo],
	convert(date, switchoffset(convert(datetimeoffset, json_value(@mainMember, '$.person.dateOfBirth')), '+02:00')) [MainMemberDOB],
	json_value(@policy, '$.policyNumber') [PolicyNumber],
	convert(date, getdate()) [ApplicationDate],
	convert(date, json_value(@policy, '$.policyInceptionDate')) [PolicyDate],
	convert(date, switchoffset(convert(datetimeoffset, json_value(@policy, '$.policyInceptionDate')), '+02:00')) [InceptionDate],
	dateadd(yyyy, 1, convert(date, switchoffset(convert(datetimeoffset, json_value(@policy, '$.policyInceptionDate')), '+02:00'))) [RenewalDate],
	json_value(@benefit, '$.name') [PlanSelected],
	convert(money, json_value(@benefit, '$.benefitRateLatest')) [BenefitSelected],
	convert(money, json_value(@benefit, '$.benefitRateLatest')) [MainMemberBenefitAmount],
	convert(money, json_value(@benefit, '$.benefitBaseRateLatest')) [BasePremium],
	convert(money, [policy].[CalculateCommission](@premium, 
	                                              json_value(@policy, '$.commissionPercentage'), 
												  json_value(@policy, '$.binderFeePercentage'))) [Commission],
	convert(money, [policy].[CalculateServiceFee](@premium, 
	                                              json_value(@policy, '$.adminPercentage'), 
	                                              json_value(@policy, '$.commissionPercentage'), 
												  json_value(@policy, '$.binderFeePercentage'))) [AdminFee],
	convert(money, case json_value(@policy, '$.isGroupPolicy')
		when 'true' then [policy].[CalculateGroupPolicyPremium] (@premium, 
	                                              json_value(@policy, '$.adminPercentage'), 
	                                              json_value(@policy, '$.commissionPercentage'), 
												  json_value(@policy, '$.binderFeePercentage'),
												  0)
		else [policy].[CalculateIndividualPolicyPremium] (@premium, 
	                                              json_value(@policy, '$.adminPercentage'), 
	                                              json_value(@policy, '$.commissionPercentage'),
												  json_value(@policy, '$.binderFeePercentage'))
	end * @multiplier) [StartingPremium],
	json_value(@policy, '$.isEuropAssist') isEuropAssist
set nocount off

end