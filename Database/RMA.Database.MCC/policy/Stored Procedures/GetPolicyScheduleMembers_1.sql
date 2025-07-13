CREATE   PROCEDURE [policy].[GetPolicyScheduleMembers] (@policyId int, @counter int)
as begin
	
	declare @members table (
		RolePlayerId int primary key,
		MemberName varchar(128),
		CoverMemberTypeId int,
		DateOfBirth date,
		IdTypeId int,
		IdNumber varchar(32),
		StartDate date,
		CoverAmount money
	)

	insert into @members
	select pn.RolePlayerId,
		UPPER(concat(pn.[FirstName], ' ', pn.[Surname])) [MemberName],
		b.[CoverMemberTypeId],
		pn.[DateOfBirth],
		pn.[IdTypeId],
		pn.[IdNumber],
		pil.[StartDate],
		t.[BenefitAmount] [CoverAmount]
	from [policy].[PolicyInsuredLives] pil
		inner join [client].[Person] pn on pn.[RolePlayerId] = pil.[RolePlayerId]
		inner join (
			select [BenefitId],
				[BenefitAmount],
				rank() over (partition by [BenefitId] order by [EffectiveDate] desc) [Rank]
			from [product].[BenefitRate] r
			where r.[IsDeleted] = 0
		) t on t.[BenefitId] = pil.[StatedBenefitId]
		inner join [product].[Benefit] b on b.[Id] = t.[BenefitId]
	where pil.[PolicyId] = @policyId
	  and pil.[InsuredLifeStatusId] != 2
	  and t.[Rank] = 1

	update m set
		m.[IdNumber] = cast(m.[DateOfBirth] as varchar(32))
	from @members m
	where isdate(left(m.[IdNumber], 10)) = 1

	select MemberName,
		CoverMemberTypeId,
		DateOfBirth,
		IdNumber,
		StartDate,
		CoverAmount
	from @members
	order by CoverMemberTypeId,
		MemberName
end