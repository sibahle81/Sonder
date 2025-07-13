
CREATE   PROCEDURE [policy].[OverAgeReminderReport]
    @StartDate AS DATE,
	@EndDate AS DATE,
	@Brokerage AS VARCHAR(255)
AS BEGIN

	declare @brokerageId int
	if isnull(@Brokerage, 'ALL') = 'ALL' begin
		set @brokerageId = 0
	end else begin
		select @brokerageId = [Id] from [broker].[Brokerage] where [Name] = @Brokerage
	end

	select * from (
		select p.PolicyId,
			pil.RolePlayerId,
			isnull(p.ParentPolicyId, -1) [ParentPolicyId],
			iif(p.ParentPolicyId is null, 'Individual', 'Group') [FuneralType],
			p.PolicyNumber [PolicyNumber],
			isnull(paPol.PolicyNumber,'Not Applicable') as [ParentPolicyNumber],
			ps.Name [ChildStatus],
			r.DisplayName [MemberName],
			per.FirstName,
			per.Surname, 
			per.IdNumber [ChildIdNumber],
			per.DateOfBirth [BirthDate],
			client.GetNextBirthDay(per.DateOfBirth) [BirthDay],
			client.CalculateAge(isnull(per.DateOfBirth, getdate())) [Age],			
			client.CalculateAge(isnull(dateadd(MONTH, -1, per.DateOfBirth), getdate())) [UpcomingAge],
			pil.RolePlayerTypeId,
			rt.Name [Relation],
			[brokerage].[Name] as [BrokerName],
			isnull([parp].DisplayName,'Not Applicable') AS [Schemename],
			ps.[Name] as [Status]
		from policy.Policy p with (nolock)
			inner join common.PolicyStatus ps with (nolock) on ps.Id = p.PolicyStatusId
			inner join policy.PolicyInsuredLives pil with (nolock) on pil.PolicyId = p.PolicyId
			inner join client.RolePlayer rp with (nolock) on rp.RolePlayerId = pil.RolePlayerId
			inner join client.RolePlayerType rt with (nolock) on rt.RolePlayerTypeId = pil.RolePlayerTypeId
			inner join client.Person per with (nolock) on per.RolePlayerId = pil.RolePlayerId
			inner join [broker].Brokerage [brokerage] (NOLOCK) ON [BROKERAGE].Id = p.BrokerageId
            inner join [client].[RolePlayer] r on r.[RolePlayerId] = p.[PolicyOwnerId]
			inner join [Client].Person cpn ON  r.RolePlayerId = cpn.RolePlayerId
			left join [policy].[Policy] paPol (nolock) on  papol.PolicyId = p.ParentPolicyId 
			left join [client].[roleplayer] parp (NOLOCK) on parp.RolePlayerId = papol.policyOwnerId
			left join product.CurrentBenefitRate br with (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = pil.StatedBenefitId

		where [brokerage].[Id] = iif(@brokerageId > 0, @brokerageId, [brokerage].[Id])
			-- and month(per.DateOfBirth) in (month(@StartDate), month(@EndDate))
			and pil.InsuredLifeStatusId = 1
			and rt.[Name] ='Child'
			and client.CalculateAge(isnull(per.DateOfBirth, getdate())) >= 21
			and p.PolicyStatusId in (1, 8, 15) 
			and p.IsDeleted = 0
			and br.BenefitName not like ('%disable%')
	) t
	where t.BirthDay between @StartDate and @EndDate
END