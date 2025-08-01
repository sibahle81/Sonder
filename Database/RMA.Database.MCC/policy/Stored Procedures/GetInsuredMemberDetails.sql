CREATE PROCEDURE [policy].[GetInsuredMemberDetails] @wizardId int = null, @policyId int = null
AS BEGIN

	declare @member table (
		RolePlayerId int,
		MemberName varchar(128),
		IdNumber varchar(64),
		DateOfBirth date,
		MemberTypeId int,
		MemberType varchar(32),
		CoverAmount money,
		Cover01 money default(0.00),
		Cover02 money default(0.00),
		Cover03 money default(0.00),
		Cover04 money default(0.00),
		Cover05 money default(0.00),
		Cover10 money default(0.00),
		Cover15 money default(0.00),
		Cover20 money default(0.00)
	)

	if (isnull(@wizardId, 0) > 0) begin

		declare @json varchar(max)
		select @json = [Data], @policyId = LinkedItemId from bpm.Wizard (nolock) where Id = @wizardId 

		declare @mainMemberId int
		declare @mainMemberSection varchar(max) = '$[0].mainMember'

		select @mainMemberId = json_value(@json, '$[0].newMainMember.person.rolePlayerId')
		-- Check if the json has a new main member section
		if (isnull(@mainMemberId, 0) > 0)
			set @mainMemberSection = '$[0].newMainMember'
		else 
			select @mainMemberId = json_value(@json, '$[0].mainMember.person.rolePlayerId')

		insert into @member (RolePlayerId, MemberName, IdNumber, DateOfBirth, MemberTypeId, MemberType, CoverAmount)
		select life.RolePlayerId,
			life.MemberName,
			life.IdNumber,
			life.DateOfBirth,
			benefit.MemberTypeId,
			benefit.MemberType,
			benefit.CoverAmount
		from openjson(@json, @mainMemberSection)
				with (
					RolePlayerId int '$.rolePlayerId',
					MemberName varchar(128) '$.displayName',
					IdNumber varchar(64) '$.person.idNumber',
					DateOfBirth date '$.person.dateOfBirth',
					Benefits nvarchar(max) '$.benefits' as json,
					IsDeleted bit '$.isDeleted'
				) life
		outer apply openjson(life.Benefits)
			with (
				BenefitType int '$.benefitType',
				MemberTypeId int '$.coverMemberType',
				MemberType varchar(32) '$.memberType',
				BenefitName varchar(128) '$.benefitName',
				Premium money '$.benefitBaseRateLatest',
				CoverAmount money '$.benefitRateLatest'
			) AS benefit
		where benefit.BenefitType = 1
		  and life.IsDeleted = 0
		union all
		select life.RolePlayerId,
			life.MemberName,
			life.IdNumber,
			life.DateOfBirth,
			benefit.MemberTypeId,
			benefit.MemberType,
			benefit.CoverAmount
		from openjson(@json, '$[0].spouse')
				with (
					RolePlayerId int '$.rolePlayerId',
					MemberName varchar(128) '$.displayName',
					IdNumber varchar(64) '$.person.idNumber',
					DateOfBirth date '$.person.dateOfBirth',
					Benefits nvarchar(max) '$.benefits' as json,
					IsDeleted bit '$.isDeleted'
				) life
		outer apply openjson(life.Benefits) 
			with (
				BenefitType int '$.benefitType',
				MemberTypeId int '$.coverMemberType',
				MemberType varchar(32) '$.memberType',
				BenefitName varchar(128) '$.benefitName',
				Premium money '$.benefitBaseRateLatest',
				CoverAmount money '$.benefitRateLatest'
			) AS benefit
		where life.IsDeleted = 0
		  and benefit.BenefitType = 1
		union all
		select life.RolePlayerId,
			life.MemberName,
			life.IdNumber,
			life.DateOfBirth,
			benefit.MemberTypeId,
			benefit.MemberType,
			benefit.CoverAmount
		from openjson(@json, '$[0].children')
				with (
					RolePlayerId int '$.rolePlayerId',
					MemberName varchar(128) '$.displayName',
					IdNumber varchar(64) '$.person.idNumber',
					DateOfBirth date '$.person.dateOfBirth',
					Benefits nvarchar(max) '$.benefits' as json,
					IsDeleted bit '$.isDeleted'
				) life
		outer apply openjson(life.Benefits) 
			with (
				BenefitType int '$.benefitType',
				MemberTypeId int '$.coverMemberType',
				MemberType varchar(32) '$.memberType',
				BenefitName varchar(128) '$.benefitName',
				Premium money '$.benefitBaseRateLatest',
				CoverAmount money '$.benefitRateLatest'
			) AS benefit
		where life.IsDeleted = 0
		  and benefit.BenefitType = 1
		union all
		select life.RolePlayerId,
			life.MemberName,
			life.IdNumber,
			life.DateOfBirth,
			benefit.MemberTypeId,
			benefit.MemberType,
			benefit.CoverAmount
		from openjson(@json, '$[0].extendedFamily')
				with (
					RolePlayerId int '$.rolePlayerId',
					MemberName varchar(128) '$.displayName',
					IdNumber varchar(64) '$.person.idNumber',
					DateOfBirth date '$.person.dateOfBirth',
					Benefits nvarchar(max) '$.benefits' as json,
					IsDeleted bit '$.isDeleted'
				) life
		outer apply openjson(life.Benefits) 
			with (
				BenefitType int '$.benefitType',
				MemberTypeId int '$.coverMemberType',
				MemberType varchar(32) '$.memberType',
				BenefitName varchar(128) '$.benefitName',
				Premium money '$.benefitBaseRateLatest',
				CoverAmount money '$.benefitRateLatest'
			) AS benefit
		where life.IsDeleted = 0
		  and benefit.BenefitType = 1

	end else begin

		insert into @member (RolePlayerId, MemberName, IdNumber, DateOfBirth, MemberTypeId, MemberType, CoverAmount)		
		select pil.RolePlayerId,
			concat(per.FirstName, ' ', per.Surname) [MemberName],
			per.IdNumber,
			per.DateOfBirth,
			br.CoverMemberTypeId,
			ct.Name,
			pil.CoverAmount
		from policy.Policy p (nolock)
			inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
			inner join client.Person per (nolock) on per.RolePlayerId = pil.RolePlayerId
			inner join product.CurrentBenefitRate br (nolock) on br.ProductOptionId = p.ProductOptionId and br.BenefitId = pil.StatedBenefitId
			inner join common.CoverMemberType ct (nolock) on ct.Id = br.CoverMemberTypeId
		where p.PolicyId = @policyId
		  and pil.InsuredLifeStatusId = 1
	end

	-- If @rate is ANY other value than decimal, the calculations are incorrect!!!!!
	declare @rate decimal(6, 2)
	declare @max money = 104000.00

	select @rate = case ai.Id when 2 then 0.04 when 2 then 0.08 else 0.00 end
	from policy.PolicyLifeExtension le (nolock)
		inner join common.AnnualIncreaseType ai (nolock) on ai.Id = le.AnnualIncreaseTypeId
	where le.PolicyId = @policyId 
	  and le.IsDeleted = 0

	set @rate = 1 + @rate
	update @member set
		Cover01 = CoverAmount * power(@rate, 1),
		Cover02 = CoverAmount * power(@rate, 2),
		Cover03 = CoverAmount * power(@rate, 3),
		Cover04 = CoverAmount * power(@rate, 4),
		Cover05 = CoverAmount * power(@rate, 5),
		Cover10 = CoverAmount * power(@rate, 10),
		Cover15 = CoverAmount * power(@rate, 15),
		Cover20 = CoverAmount * power(@rate, 20)

	update @member set Cover01 = @max where Cover01 > @max
	update @member set Cover02 = @max where Cover02 > @max
	update @member set Cover03 = @max where Cover03 > @max
	update @member set Cover04 = @max where Cover04 > @max
	update @member set Cover05 = @max where Cover05 > @max
	update @member set Cover10 = @max where Cover10 > @max
	update @member set Cover15 = @max where Cover15 > @max
	update @member set Cover20 = @max where Cover20 > @max

	select RolePlayerId,
		MemberName,
		case when isnumeric(IdNumber) = 1 and len(IdNumber) > 10 then IdNumber else format(DateOfBirth, 'yyyy/MM/dd') end [IdNumber],
		DateOfBirth,
		MemberTypeId,
		MemberType,
		CoverAmount,
		Cover01,
		Cover02,
		Cover03,
		Cover04,
		Cover05,
		Cover10,
		Cover15,
		Cover20
	from @member
	order by MemberTypeId,
		MemberName

END
GO
