CREATE PROCEDURE [policy].[GetPolicyAnnualCoverIncreases] @wizardId int = null, @policyId int = null
AS BEGIN

	if (isnull(@wizardId, 0) > 0) begin

		declare @json varchar(max)
		select @json = [Data] from bpm.Wizard (nolock) where Id = @wizardId 

		declare @mainMemberId int
		declare @mainMemberSection varchar(max) = '$[0].mainMember'

		declare @rolePlayerId int
		select @rolePlayerId = json_value(@json, '$[0].newMainMember.person.rolePlayerId')
		-- Check if the json has a new main member section
		if (isnull(@mainMemberId, 0) > 0)
			set @mainMemberSection = '$[0].newMainMember'
		else 
			select @mainMemberId = json_value(@json, '$[0].mainMember.person.rolePlayerId')

		select case ai.Id when 2 then 0.05 when 3 then 0.10 else 0.00 end [PremiumIncrease],
		       case ai.Id when 2 then 0.04 when 3 then 0.08 else 0.00 end [CoverIncrease],
			   format(client.GetNextBirthDay(InceptionDate), 'd MMMM yyyy') [NextIncreaseDate],
			   case ai.Id when 0 then '' else 'Annualy' end [IncreaseFrequency]
		from openjson(@json, @mainMemberSection) 
			with (
				InceptionDate date '$.policies[0].policyInceptionDate',
				AnnualIncreaseTypeId int '$.policies[0].policyLifeExtension.annualIncreaseType',
				AnnualIncreaseMonth int  '$.policies[0].policyLifeExtension.annualIncreaseMonth'
			) p
			inner join common.AnnualIncreaseType ai (nolock) on ai.Id = p.AnnualIncreaseTypeId

	end else begin
		select case ai.Id when 2 then 0.05 when 3 then 0.10 else 0.00 end [PremiumIncrease],
		       case ai.Id when 2 then 0.04 when 3 then 0.08 else 0.00 end [CoverIncrease],
			   format(client.GetNextBirthDay(p.PolicyInceptionDate), 'd MMMM yyyy') [NextIncreaseDate],
			   case ai.Id when 0 then '' else 'Annualy' end [IncreaseFrequency]
		from policy.Policy p (nolock)
			inner join policy.PolicyLifeExtension le (nolock) on le.PolicyId = p.PolicyId
			inner join common.AnnualIncreaseType ai (nolock) on ai.Id = le.AnnualIncreaseTypeId
		where p.PolicyId = @policyId
		  and le.IsDeleted = 0
	end
END
