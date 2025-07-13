
CREATE   PROCEDURE [Load].[InsertConsolidatedFuneralMembers] (@fileIdentifier uniqueidentifier)
AS BEGIN

	-- declare @fileIdentifier uniqueidentifier = 'D5795AB5-21D9-4FB2-B338-02D28C0BCEE8'

	set nocount on

	delete from [Load].[ConsolidatedFuneralMember] where [FileIdentifier] = @fileIdentifier

	-- Temporary (hopefully)
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '1' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'January'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '2' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'February'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '3' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'March'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '4' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'April'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '5' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'May'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '6' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'June'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '7' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'July'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '8' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'August'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '9' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'September'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '10' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'October'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '10' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'Octomber'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '11' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'November'
	update [Load].[ConsolidatedFuneral] set [IncreaseMonth] = '12' where [FileIdentifier] = @fileIdentifier and [IncreaseMonth] = 'December'

	update [Load].[ConsolidatedFuneral] set [PreviousInsurerCoverAmount] = replace([PreviousInsurerCoverAmount], '.00', '') where [FileIdentifier] = @fileIdentifier
	update [Load].[ConsolidatedFuneral] set [CoverAmount] = replace([CoverAmount], '.00', '') where [FileIdentifier] = @fileIdentifier

	-- Temporary (hopefully) issue experienced with  Matla tablet app
	update [Load].[ConsolidatedFuneral] set
		[Premium] = replace([Premium], ',', '.')
	where [FileIdentifier] = @fileIdentifier
	  and [Premium] like '%,%'
	update [Load].[ConsolidatedFuneral] set
		[CoverAmount] = replace([CoverAmount], ',', '.')
	where [FileIdentifier] = @fileIdentifier 
	  and [CoverAmount] like '%,%'
	update [Load].[ConsolidatedFuneral] set
		[PreviousInsurerCoverAmount] = replace([PreviousInsurerCoverAmount], ',', '.')
	where [FileIdentifier] = [FileIdentifier]
	  and [PreviousInsurerCoverAmount] like '%,%'
	update [Load].[ConsolidatedFuneral] set
		[IdNumber] = [PassportNumber],
		[PassportNumber] = ''
	where [FileIdentifier] = @fileIdentifier
	  and len([PassportNumber]) = 13
	  and isnumeric([PassportNumber]) = 1

	-- INSERT RECORDS INTO TABLE
	insert into [Load].[ConsolidatedFuneralMember]
		([FileIdentifier]
		,[ClientReference]
		,[JoinDate]
		,[CoverMemberTypeId]
		,[RolePlayerTypeId]
		,[IdTypeId]
		,[IdNumber]
		,[MainMemberIdNumber]
		,[FirstName]
		,[Surname]
		,[MemberName]
		,[DateOfBirth]
		,[Gender]
		,[Age]
		,[JoinAge]
		,[Affordability]
		,[ProductOption]
		,[BenefitName]
		,[PolicyId]
		,[PolicyPremium]
		,[PolicyCover]
		,[ExistingCover]
		,[Multiplier]
		,[RolePlayerId]
		,[MainMemberRolePlayerId]
		,[ProductOptionId]
		,[BenefitId]
		,[PolicyExists]
		,[RolePlayerExists]
		,[RepIdNumber]
		,[Address1]
		,[Address2]
		,[City]
		,[Province]
		,[Country]
		,[PostalCode]
		,[PostalAddress1]
		,[PostalAddress2]
		,[PostalCity]
		,[PostalProvince]
		,[PostalCountry]
		,[PostalPostCode]
		,[TelNo]
		,[CelNo]
		,[Email]
		,[PreferredCommunication] 
		,[DebitOrderDay]
		,[AnnualIncreaseType]
		,[AnnualIncreaseMonth]
		,[TestDateOfBirth]
		,[TestJoinDate])
	select distinct cf.[FileIdentifier]
		,trim(isnull(cf.[ClientReference], '')) [ClientReference]
		,null [JoinDate]
		,case cf.[ClientType]
			when 'Main Member' then 1
			when 'Spouse' then 2
			when 'Child' then 3
			when 'Beneficiary' then 99
			else 4
		 end [CoverMemberTypeId]
		 ,case cf.[ClientType]
			when 'Main Member' then 10
			when 'Spouse' then 11
			when 'Child' then 32
			when 'Beneficiary' then 41
			else 38
		 end [RolePlayerTypeId]
		,iif(isnull(cf.[IdNumber], '') = '', 2, 1) [IdTypeId]
		,iif(isnull(cf.[IdNumber], '') = '', cf.[PassportNumber], left(cf.[IdNumber], 16)) [IdNumber]
		,case cf.[ClientType] when 'Main Member' then '' else cf.[MainMemberId] end [MainMemberIdNumber]
		,replace(cf.[FirstName], '  ', ' ') [FirstName]
		,replace(cf.[Surname], '  ', ' ') [Surname]
		,replace(concat(cf.[FirstName], ' ', cf.[Surname]), '  ', ' ') [MemberName]
		,null [DateOfBirth]
		,cf.[Gender]
		,-1 [Age]
		,-1 [JoinAge]
		,cf.[AffordibilityChecked]
		,cf.[ProductOption]
		,trim(replace(cf.[BenefitName], '  ', ' ')) [BenefitName]
		,0 [PolicyId]
		,iif(isnumeric(cf.[Premium]) = 1, cf.[Premium], '0.00') [PolicyPremium]
		,iif(isnumeric(cf.[CoverAmount]) = 1, cf.[CoverAmount], '0.00') [PolicyCover]
		,0.0 [ExistingCover]
		,1 [Multiplier]
		,0 [RolePlayerId]
		,0 [MainMemberRolePlayerId]
		,0 [ProductOptionId]
		,0 [BenefitId]
		,0 [PolicyExists]
		,0 [RolePlayerExists]
		,cf.[RepIdNumber]
		,cf.[Address1]
		,cf.[Address2]
		,cf.[City]
		,cf.[Province]
		,cf.[Country]
		,cf.[PostalCode]
		,cf.[PostalAddress1]
		,cf.[PostalAddress2]
		,cf.[PostalCity]
		,cf.[PostalProvince]
		,cf.[PostalCountry]
		,cf.[PostalPostCode]
		,cf.[Telephone] [TelNo]
		,cf.[Mobile] [CelNo]
		,cf.[Email]
		,ct.[Id] [PreferredCommunication]
		,iif(isnumeric(cf.[DebitOrderDay]) = 1, cf.[DebitOrderDay], null) [DebitOrderDay]
		,case cf.[AnnualIncreaseOption]
			when 'No increase' then 1
			when 'Option 1' then 2
			when 'Option 2' then 3
			else case 
				when left(cf.[AnnualIncreaseOption], 2) = '5%' then 2
				when left(cf.[AnnualIncreaseOption], 3) = '10%' then 3
				else null
			end
		 end [AnnualIncreaseType]
		,cf.[IncreaseMonth] -- iif(isdate(concat('1 ', cf.[IncreaseMonth], ' 2020')) = 1, month(concat('1 ', cf.[IncreaseMonth], ' 2020')), null) [AnnualIncreaseMonth]
		,convert(date, case isnumeric(DateOfBirth) when 1 then convert(datetime, cast(DateOfBirth as int) - 2) else case isdate(DateOfBirth) when 1 then convert(datetime, DateOfBirth) else null end end) [TestDateOfBirth]
		,convert(date, case isnumeric(JoinDate) when 1 then convert(datetime, cast(JoinDate as int) - 2) else case isdate(JoinDate) when 1 then convert(datetime, JoinDate) else null end end) [TestJoinDate]
	from [Load].[ConsolidatedFuneral] cf 
		left join [common].[CommunicationType] ct   on ct.[Name] = cf.[PreferredCommunication]
	where cf.[FileIdentifier] = @fileIdentifier
	  and (isnull(cf.[BenefitName], '') <> '' or cf.[ClientType] = 'Beneficiary')

	update m set
		m.[MainMemberIdNumber] = m.[IdNumber]
	from [Load].[ConsolidatedFuneralMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] = 1

	-- UPDATE CLIENT REFERENCES OF MEMBERS WITH  MORE THAN ONE POLICY
	update m set
		m.[ClientReference] = t.[NewClientReference]
	from [Load].[ConsolidatedFuneralMember] m
		inner join (
			select m.[FileIdentifier],	
			m.[ClientReference],	
			m.[MainMemberIdNumber],
			concat(m.[MainMemberIdNumber], '-', t.[Rank]) [NewClientReference],
			count(*) [Members]
			from [Load].[ConsolidatedFuneralMember] m
			inner join (
				select m.[FileIdentifier],
				m.[ClientReference],
				m.[IdNumber],
				rank() over (partition by m.[IdNumber] order by m.[Id]) [Rank]
				from [Load].[ConsolidatedFuneralMember] m
				inner join (
					select [FileIdentifier],
					[IdNumber],
					1 [CoverMemberTypeId],
					count(*) [Policies]
					from [Load].[ConsolidatedFuneralMember]
					where [FileIdentifier] = @fileIdentifier
					and [CoverMemberTypeId] = 1
					and left([ClientReference], 3) = 'XXX'
					group by [FileIdentifier],[IdNumber]
					having count(*) > 1
				) t on t.[FileIdentifier] = m.[FileIdentifier] and m.[CoverMemberTypeId] = t.[CoverMemberTypeId] and t.[IdNumber] = m.[IdNumber]
			) t on t.[FileIdentifier] = m.[FileIdentifier] and t.[IdNumber] = m.[MainMemberIdNumber] and t.[ClientReference] = m.[ClientReference]
			group by m.[FileIdentifier],
			m.[ClientReference],	
			m.[MainMemberIdNumber],
			t.[Rank]
		) t on t.[FileIdentifier] = m.[FileIdentifier] and t.[ClientReference] = m.[ClientReference] and t.[MainMemberIdNumber] = m.[MainMemberIdNumber]

	set nocount off
	
END