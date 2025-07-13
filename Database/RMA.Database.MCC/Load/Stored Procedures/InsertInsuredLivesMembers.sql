CREATE   PROCEDURE [Load].[InsertInsuredLivesMembers] (@fileIdentifier uniqueidentifier)
as begin

	set nocount on

	delete from [Load].[InsuredLivesMember] where [FileIdentifier] = @fileIdentifier
	update [Load].[InsuredLivesMessage] set [Message] = 'Loading insured lives from import file...' where [FileIdentifier] = @fileIdentifier

	-- INSERT RECORDS INTO TABLE
	insert into [Load].[InsuredLivesMember]
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
		,NULL [ClientReference]
		,null [JoinDate]
		,NULL [CoverMemberTypeId]
		,NULL [RolePlayerTypeId]
		,iif(isnull(pl.[IdNumber], '') = '', 2, 1) [IdTypeId]
		,iif(isnull(pl.[IdNumber], '') = '', pl.[Passport], left(pl.[IdNumber], 13)) [IdNumber]
		,NULL [MainMemberIdNumber]
		,pl.[FirstName]
		,pl.[Surname]
		,concat(pl.[FirstName], ' ', pl.[Surname]) [MemberName]
		,pl.[DateOfBirth] [DateOfBirth]
		,-1 [Age]
		,-1 [JoinAge]
		,NULL [BenefitName]
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
		,NULL
		,NULL
		,NULL
		,pl.[Province]
		,NULL
		,pl.[PostalCode]
		,pl.[PostalAddress]
		,NULL
		,NULL
		,NULL
		,NULL
		,NULL
		,NULL
		,pl.[CellNumber] [CelNo]
		,NULL
		,NULL
		,NULL
		,NULL
		,NULL
		,NULL
		,pl.[DateOfBirth] [TestDateOfBirth]
		,NULL [TestJoinDate]
		,1 [MemberStatus]
	from [Load].[InsuredLivesCompany] c
		inner join [Load].[InsuredLives] pl with (nolock) on pl.[FileIdentifier] = c.[FileIdentifier]
	where c.[FileIdentifier] = @fileIdentifier

	update m set
		m.[MainMemberIdNumber] = m.[IdNumber]
	from [Load].[InsuredLivesMember] m
	where m.[FileIdentifier] = @fileIdentifier
	  and m.[CoverMemberTypeId] = 1
	
	set nocount off
end