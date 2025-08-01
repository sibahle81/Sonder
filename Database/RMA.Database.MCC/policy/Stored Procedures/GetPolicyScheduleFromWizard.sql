CREATE PROCEDURE [policy].[GetPolicyScheduleFromWizard] @wizardId int = null, @policyId int = null
as begin

	set nocount on

	if (isnull(@policyId, 0) > 0) begin
		select b.Id [BrokerId],
			b.Name [Brokerage],
			r.Id [RepresentativeId],
			concat(r.FirstName, ' ', r.SurnameOrCompanyName) [Representative],
			concat(main.FirstName, ' ', main.Surname) [MainMemberName],
			main.IdNumber [MainMemberIdNo],
			main.DateOfBirth [MainMemberDob],
			p.PolicyNumber,
			'The Main Member' [PolicyScheduleOwnerText],
			cast(getdate() as date) [ApplicationDate],
			cast(policyInceptionDate as date) [PolicyDate],
			cast(policyInceptionDate as date) [InceptionDate],
			client.GetNextBirthDay(p.PolicyInceptionDate) [RenewalDate],
			br.BenefitName [PlanSelected],
			br.BenefitAmount [BenefitSelected],
			br.BenefitAmount [MainMemberBenefitAmount],
			cast(rates.BaseRate as money) [BasePremium],
			cast([policy].[CalculateCommission](rates.BaseRate, p.CommissionPercentage, p.BinderFeePercentage) as money) [Commission],
			cast([policy].[CalculateServiceFee](rates.BaseRate, p.AdminPercentage, p.CommissionPercentage, p.BinderFeePercentage) as money) [AdminFee],
			cast(p.InstallmentPremium as money) [StartingPremium],
			iif(p.IsEuropAssist = 1, 'true', 'false') [IsEuropAssist]
		from policy.Policy p (nolock)
			inner join broker.Brokerage b (nolock) on b.Id = p.BrokerageId
			inner join broker.Representative r (nolock) on r.Id = p.RepresentativeId
			inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId and pil.RolePlayerTypeId = 10 and pil.InsuredLifeStatusId = 1
			inner join client.Person main (nolock) on main.RolePlayerId = pil.RolePlayerId
			left join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = pil.StatedBenefitId
			left join (
				select p.PolicyId,
					sum(br.BaseRate) [BaseRate]
				from policy.Policy p (nolock)
					inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
					inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = pil.StatedBenefitId
				where p.PolicyId = @policyId
				  and pil.InsuredLifeStatusId = 1
				group by p.PolicyId
			) rates on rates.PolicyId = p.PolicyId
		where p.PolicyId = @policyId
	end else if (isnull(@wizardId, 0) > 0) begin
		declare @mainMember varchar(max)
		declare @policy varchar(max)
		declare @benefit varchar(max)
		declare @spouse varchar(max)
		declare @children varchar(max)
		declare @family varchar(max)
		declare @brokerage varchar(max)
		declare @representative varchar(max)
		declare @PolicyScheduleOwnerText varchar(250)
		declare @premiumAdjustmentPercentage decimal(6, 4)

		declare @multiplier int

		select @mainMember = iif(json_query([Data], '$[0].newMainMember') is null, 
				json_query([Data], '$[0].mainMember'), 
				json_query([Data], '$[0].newMainMember')),
			@policy = json_query([Data], '$[0].mainMember.policies[0]'),
			@benefit = iif(json_query([Data], '$[0].newMainMember') is null, 
				json_query([Data], '$[0].mainMember.benefits[0]'), 
				json_query([Data], '$[0].newMainMember.benefits[0]')),
			@brokerage = json_query([Data], '$[0].brokerage'),
			@representative = json_query([Data], '$[0].representative'),
			@spouse = json_query([Data], '$[0].spouse'),
			@children = json_query([Data], '$[0].children'),
			@family = json_query([Data], '$[0].extendedFamily')
		from [bpm].[Wizard]  where [Id] = @wizardId

		select @premiumAdjustmentPercentage = isnull(json_value(@policy, '$.premiumAdjustmentPercentage'), 0)

		select @multiplier = case json_value(@policy, '$.paymentFrequency')
			when '1' then 12
			when '2' then 1
			when '3' then 3
			when '4' then 6
			else 0
		end

		declare @rate table (
			Premium money,
			BenefitTypeId int
		)

		insert into @rate
			select benefitBaseRateLatest, benefitType
			from openjson(@mainMember) with (Benefits nvarchar(max) '$.benefits' as json) cb
			outer apply openjson (cb.Benefits) with (benefitBaseRateLatest money, benefitType int)
			where benefitType = 1

		insert into @rate
			select benefitBaseRateLatest, benefitType
			from openjson(@spouse) with (Benefits nvarchar(max) '$.benefits' as json) cb
			outer apply openjson (cb.Benefits) with (benefitBaseRateLatest money, benefitType int)
			where benefitType = 1

		insert into @rate
			select benefitBaseRateLatest, benefitType
			from openjson(@children) with (Benefits nvarchar(max) '$.benefits' as json) cb
			outer apply openjson (cb.Benefits) with (benefitBaseRateLatest money, benefitType int)
			where benefitType = 1

		insert into @rate
			select benefitBaseRateLatest, benefitType
			from openjson(@family) with (Benefits nvarchar(max) '$.benefits' as json) cb
			outer apply openjson (cb.Benefits) with (benefitBaseRateLatest money, benefitType int)
			where benefitType = 1

		declare @premium money
		select @premium = sum(Premium) from @rate

		SELECT @PolicyScheduleOwnerText = CASE WHEN(ISNULL(pdom.PolicyPayeeId,0) = 0) THEN NULL ELSE rp.DisplayName END
		FROM [POLICY].[POLICY] POL (NOLOCK)
			inner join [client].RolePlayer rp (nolock) on rp.RolePlayerId = POL.PolicyPayeeId
			INNER JOIN [CLIENT].[COMPANY] COMP (NOLOCK) ON COMP.RolePlayerId = rp.RolePlayerId
			LEFT JOIN [policy].PolicyScheduleOwnerMap pdom (nolock) on pdom.PolicyPayeeId = pol.PolicyPayeeId
		where pol.PolicyNumber = json_value(@policy, '$.policyNumber') 
		  and pol.ParentPolicyId is not null 

		select json_value(@brokerage, '$.id') [BrokerId],
			json_value(@brokerage, '$.name') [Brokerage],
			json_value(@representative, '$.id') [RepresentativeId],
			concat(json_value(@representative, '$.firstName'), ' ', json_value(@representative, '$.surnameOrCompanyName')) [Representative],
			json_value(@mainMember, '$.displayName') [MainMemberName],
			case json_value(@mainMember, '$.person.idType')
				when '1' then json_value(@mainMember, '$.person.idNumber')
				else          json_value(@mainMember, '$.person.passportNumber')
			end [MainMemberIdNo],
			convert(date, switchoffset(convert(datetimeoffset, json_value(@mainMember, '$.person.dateOfBirth')), '+02:00')) [MainMemberDOB],
			json_value(@policy, '$.policyNumber') [PolicyNumber],
			ISNULL(@PolicyScheduleOwnerText, 'The Main Member') as PolicyScheduleOwnerText,
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
			convert(money, case isnull(json_value(@policy, '$.parentPolicyId'), 0) 
				when 0 then [policy].[CalculateIndividualPolicyPremium] (@premium, 
														  json_value(@policy, '$.adminPercentage'), 
														  json_value(@policy, '$.commissionPercentage'),
														  json_value(@policy, '$.binderFeePercentage'))
				else [policy].[CalculateGroupPolicyPremium] (@premium, 
														  json_value(@policy, '$.adminPercentage'), 
														  json_value(@policy, '$.commissionPercentage'), 
														  json_value(@policy, '$.binderFeePercentage'),
														  @premiumAdjustmentPercentage)
			end * @multiplier) [StartingPremium],
			json_value(@policy, '$.isEuropAssist') isEuropAssist
	end

	set nocount off

end
