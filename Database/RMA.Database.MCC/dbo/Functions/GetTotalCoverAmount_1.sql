CREATE FUNCTION [dbo].[GetTotalCoverAmount] (@idTypeId int, @idNumber varchar(64), @policyId int = 0) RETURNS decimal
AS BEGIN

	declare @amount decimal
	set @policyId = isnull(@policyId, 0)

	select @amount = isnull(sum(t.[CoverAmount]), 0) from (
		select distinct p.[PolicyId],
			per.[RolePlayerId],
			iif(isnull(pil.[Premium], 0) > 0, pil.[Premium], br.[BaseRate]) [Premium],
			iif(isnull(pil.[CoverAmount], 0) > 0, pil.[CoverAmount], br.[BenefitAmount]) [CoverAmount]
		from policy.Policy p (nolock)
			inner join [policy].[PolicyInsuredLives] [pil] with (nolock) 
				on pil.[PolicyId] = p.[PolicyId]
			inner join [client].[Person] [per] with (nolock) 
				on per.[RolePlayerId] = pil.[RolePlayerId]
			inner join [product].[CurrentBenefitRate] [br] with (nolock) 
				on br.[ProductOptionId] = p.[ProductOptionId]
				and br.[BenefitId] = pil.[StatedBenefitId]
		where p.[PolicyId] <> @policyId
		  and p.[IsDeleted] = 0
		  and p.[PolicyStatusId] != 2
		  and pil.[InsuredLifeStatusId] = 1
		  and per.[IdTypeId] = @idTypeId
		  and per.[IdNumber] = @idNumber
		  and per.[IsDeleted] = 0
	) t

	return @amount

END