CREATE   PROCEDURE [Load].[ImportInsuredLivesCompany] (@fileIdentifier uniqueidentifier, @userId varchar(64))
as begin

	--declare @fileIdentifier uniqueidentifier = '3BAE94F1-7F98-4DC4-961D-38A626861315'
	--declare @userId varchar(128) = 'ccilliers@randmutual.co.za'

	set nocount on

	Declare @policyID INT
	Declare @policyNumber varchar(50)
	Declare @memberNumber varchar(50)
	Declare @roleplayerID INT
	Declare @industryId INT
	Declare @companyName varchar(100)

	Select Top 1 @memberNumber = MemberNumber from [Load].[InsuredLives] where FileIdentifier = @fileIdentifier
	Select @roleplayerID = RolePlayerId,@industryId = IndustryId  from [client].[finPayee] where FinPayeNumber = @memberNumber
	Select @companyName = Name from [client].[Company] c with (nolock) where RoleplayerId = @roleplayerID

	-- Add the company
	insert into [Load].[InsuredLivesMessage] values (@fileIdentifier, 'Loading parent policy details...');
	insert into [Load].[InsuredLivesCompany]
		select @fileIdentifier [FileIdentifier],
					p.[PolicyId],
					p.[PolicyNumber],
					@roleplayerID [RolePlayerId],
					@companyName [Company],
					p.[ProductOptionId],
					p.[PolicyInceptionDate],
					p.[CommissionPercentage],
					p.[AdminPercentage],
					p.[BinderFeePercentage],
					p.[PremiumAdjustmentPercentage],
					p.[PaymentFrequencyId],
					0 [IsDeleted],
					@userId [CreatedBy],
					getdate() [CreatedDate],
					@userId [ModifiedBy],
					getdate() [ModifiedDate],
					p.[IsEuropAssist]
		from [policy].[Policy] p with (nolock) 
		where p.PolicyOwnerId = @roleplayerID
	
	declare @isEuropAssist bit
	declare @productOptionId int
	select @productOptionId = ProductOptionid, @isEuropAssist = IsEuropAssist from [Load].[PremiumListingCompany] with (nolock) where [FileIdentifier] = @fileIdentifier

	-- Add the benefits for the company's selected product option
	update [Load].[InsuredLivesMessage] set [Message] = 'Loading policy benefit details...' where [FileIdentifier] = @fileIdentifier

	insert into [Load].[InsuredLivesBenefit]
	select t.[FileIdentifier],
			t.[ProductOptionId],
			t.[BenefitId],
			t.[BenefitName],
			t.[CoverMemberTypeId],
			t.[BenefitRate],
			t.[BenefitAmount],
			200 [MaxPersonsPerProductOption],
			200 [MaxPersonsPerBenefit],
			0 [MinEntryAge],
			200 [MaxEntryAge],
			9999999.0 [CapCover],
			iif(t.[CoverMemberTypeId] = 1 and t.[IsEuropAssist] = 1, [policy].[GetEuropAssistFee](t.[CommissionPercentage]), 0.0)
	from (
		select c.[FileIdentifier],
				c.[ProductOptionId],	
				b.[Id] [BenefitId],
				trim(replace(b.[Name], '  ', ' ')) [BenefitName],
				b.[CoverMemberTypeId],
				br.[BaseRate] [BenefitRate],
				br.[BenefitAmount],
				c.[IsEuropAssist],
				c.[CommissionPercentage],
				rank() over (partition by br.[BenefitId] order by br.[EffectiveDate] desc) [Rank]
		from [Load].[InsuredLivesCompany] c with (nolock)
			inner join [product].[ProductOptionBenefit] pb with (nolock) on pb.[ProductOptionId] = c.[ProductOptionId]
			inner join [product].[Benefit] b with (nolock) on b.[Id] = pb.[BenefitId]
			inner join [product].[BenefitRate] br with (nolock) on br.[BenefitId] = b.[Id]
		where c.[FileIdentifier] = @fileIdentifier
		    and br.[IsDeleted] = 0
			and b.[IsDeleted] = 0
	) t
	where t.[Rank] = 1
	order by t.[CoverMemberTypeId], t.[BenefitName]

	-- Get maximum number of people per benefit
	update b set 
		b.[MaxPersonsPerBenefit] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b with (nolock)
		inner join [product].[BenefitRule] r with (nolock) on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 10

	-- Get maximum entry age per benfit
	update b set 
		b.[MaxEntryAge] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b  with (nolock)
		inner join [product].[BenefitRule] r  with (nolock) on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 11

	-- Get minimum entry age per benefit
	update b set 
		b.[MinEntryAge] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b  with (nolock)
		inner join [product].[BenefitRule] r with (nolock) on r.[BenefitId] = b.[Benefitid]
	where b.[FileIdentifier] = @fileIdentifier
	  and r.[RuleId] = 12

	-- Max number of spouses per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b inner join [product].[ProductOptionRule] r on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 2
		and r.[RuleId] = 37
	-- Max number of children per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b inner join [product].[ProductOptionRule] r on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 3
		and r.[RuleId] = 38
	-- Max number of extended family members per product option
	update b set b.[MaxPersonsPerProductOption] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b inner join [product].[ProductOptionRule] r on r.[ProductOptionId] = b.[ProductOptionId]
	where b.[FileIdentifier] = @fileIdentifier
		and b.[CoverMemberTypeId] = 4
		and r.[RuleId] = 39

	-- Update cap cover for children under 5
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 2
	  and charindex(replace(b.[BenefitName], ' ', ''), '-5)') > 1
	-- Update cap cover for children under 13
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 3
	  and charindex(replace(b.[BenefitName], ' ', ''), '-13)') > 1
	-- Update cap cover for children under 21
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] = 3
	  and r.[RuleId] = 4
	  and charindex(replace(b.[BenefitName], ' ', ''), '-21)') > 1
	-- Update cap cover for adult members
	update b set b.[CapCover] = json_value(r.[RuleConfiguration], '$[0].fieldValue')
	from [Load].[InsuredLivesBenefit] b
		inner join [product].[ProductOption] po on po.[Id] = b.[ProductOptionId]
		inner join [product].[ProductRule] r on r.[ProductId] = po.[ProductId]
	where b.[FileIdentifier] = @fileIdentifier
	  and b.[CoverMemberTypeId] != 3
	  and r.[RuleId] = 42

	set nocount off

end