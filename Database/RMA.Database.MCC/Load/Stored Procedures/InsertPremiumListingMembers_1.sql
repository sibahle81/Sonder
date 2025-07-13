
CREATE   PROCEDURE [Load].[InsertPremiumListingMembers] (@fileIdentifier uniqueidentifier)
as begin

	set nocount on

	delete from [Load].[PremiumListingMember] where [FileIdentifier] = @fileIdentifier
	update [Load].[PremiumListingMessage] set [Message] = 'Loading members from import file...' where [FileIdentifier] = @fileIdentifier

	-- INSERT RECORDS INTO TABLE
	insert into [Load].[PremiumListingMember]
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
		,[Age]
		,[JoinAge]
		,[BenefitName]
		,[ParentPolicyId]
		,[PolicyId]
		,[PolicyPremium]
		,[ExistingCover]
		,[Multiplier]
		,[RolePlayerId]
		,[MainMemberRolePlayerId]
		,[BenefitId]
		,[PolicyExists]
		,[RolePlayerExists]
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
		,[PreviousInsurer]
		,[PreviousInsurerPolicyNumber]
		,[PreviousInsurerStartDate]
		,[PreviousInsurerEndDate]
		,[TestDateOfBirth]
		,[TestJoinDate]
		,[MemberStatus])
	select pl.[FileIdentifier]
		,trim(isnull(pl.[ClientReference], '')) [ClientReference]
		,null [JoinDate]
		,case pl.[ClientType]
			when 'Main Member' then 1
			when 'Spouse' then 2
			when 'Child' then 3
			when 'Beneficiary' then 99
			else 4
		 end [CoverMemberTypeId]
		 ,case pl.[ClientType]
			when 'Main Member' then 10
			when 'Spouse' then 11
			when 'Child' then 32
			when 'Beneficiary' then 41
			else 38
		 end [RolePlayerTypeId]
		,iif(isnull(pl.[IdNumber], '') = '', 2, 1) [IdTypeId]
		,iif(isnull(pl.[IdNumber], '') = '', pl.[PassportNumber], left(pl.[IdNumber], 13)) [IdNumber]
		,case pl.[ClientType] when 'Main Member' then '' else pl.[MainMemberId] end [MainMemberIdNumber]
		,pl.[FirstName]
		,pl.[Surname]
		,concat(pl.[FirstName], ' ', pl.[Surname]) [MemberName]
		,null [DateOfBirth]
		,-1 [Age]
		,-1 [JoinAge]
		,trim(replace(pl.[BenefitName], '  ', ' ')) [BenefitName]
		,c.[PolicyId] [ParentPolicyId]
		,0 [PolicyId]
		,0.0 [PolicyPremium]
		,0.0 [ExistingCover]
		,case c.[PaymentFrequencyId]
			when 1 then 12
			when 3 then 4
			when 4 then 6
			else 1
		end [Multiplier]
		,0 [RolePlayerId]
		,0 [MainMemberRolePlayerId]
		,0 [BenefitId]
		,0 [PolicyExists]
		,0 [RolePlayerExists]
		,pl.[Address1]
		,pl.[Address2]
		,pl.[City]
		,pl.[Province]
		,pl.[Country]
		,pl.[PostalCode]
		,pl.[PostalAddress1]
		,pl.[PostalAddress2]
		,pl.[PostalCity]
		,pl.[PostalProvince]
		,pl.[PostalCountry]
		,pl.[PostalPostCode]
		,pl.[Telephone] [TelNo]
		,pl.[Mobile] [CelNo]
		,pl.[Email]
		,ct.[Id] [PreferredCommunication]
		,pl.[PreviousInsurer]
		,pl.[PreviousInsurerPolicyNumber]
		,pl.[PreviousInsurerStartDate]
		,pl.[PreviousInsurerEndDate]
		,convert(date, case isnumeric(DateOfBirth) when 1 then convert(datetime, cast(DateOfBirth as int) - 2) else case isdate(DateOfBirth) when 1 then convert(datetime, DateOfBirth) else null end end) [TestDateOfBirth]
		,convert(date, case isnumeric(JoinDate) when 1 then convert(datetime, cast(JoinDate as int) - 2) else case isdate(JoinDate) when 1 then convert(datetime, JoinDate) else null end end) [TestJoinDate]
		,1 [MemberStatus]
	from [Load].[PremiumListingCompany] c
		inner join [Load].[PremiumListing] pl with (nolock) on pl.[FileIdentifier] = c.[FileIdentifier]
		left join [common].[CommunicationType] ct with (nolock) on ct.[Name] = pl.[PreferredCommunication]
	where c.[FileIdentifier] = @fileIdentifier

	update m set
		m.[MainMemberIdNumber] = m.[IdNumber]
	from [Load].[PremiumListingMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] = 1
	-- UPDATE CLIENT REFERENCES OF MEMBERS WITH MORE THAN ONE POLICY
	update m set
		m.[ClientReference] = t.[NewClientReference]
	from [Load].[PremiumListingMember] m
		inner join (
			select m.[FileIdentifier],	
			m.[ClientReference],	
			m.[MainMemberIdNumber],
			concat(m.[MainMemberIdNumber], '-', t.[Rank]) [NewClientReference],
			count(*) [Members]
			from [Load].[PremiumListingMember] m
			inner join (
				select m.[FileIdentifier],
				m.[ClientReference],
				m.[IdNumber],
				rank() over (partition by m.[IdNumber] order by m.[Id]) [Rank]
				from [Load].[PremiumListingMember] m
				inner join (
					select [FileIdentifier],
					[IdNumber],
					1 [CoverMemberTypeId],
					count(*) [Policies]
					from [Load].[PremiumListingMember]
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
end