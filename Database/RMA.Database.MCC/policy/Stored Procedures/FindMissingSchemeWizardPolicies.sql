CREATE PROCEDURE policy.FindMissingSchemeWizardPolicies
AS BEGIN

	-- Date range can be limited or not. Make null to get everything
	declare @startDate date = dateadd(year, -2, getdate())

	-- Temporary table for wizard details
	declare @wizard table (
		WizardId int,
		WizardName varchar(128),
		WizardStatus varchar(32),
		Company varchar(128),
		FileIdentifier uniqueidentifier,
		CreateNewPolicies varchar(16),
		CreatedBy varchar(128),
		CreatedDate date,
		BrokerageName varchar(128),
		SchemeName varchar(128),
		ParentPolicyNumber varchar(32),
		MissingPolicies int
	)

	-- Get all completed scheme onboarding wizards
	insert into @wizard 
		select w.Id [WizardId],
			w.[Name] [WizardName],
			ws.[Name] [WizardStatus],
			json_value(w.[Data], '$[0].company') [Company],
			json_value(w.[Data], '$[0].fileIdentifier') [FileIdentifier],
			isnull(json_value(w.[Data], '$[0].createNewPolicies'), 'false') [CreateNewPolicies],
			w.CreatedBy,
			w.CreatedDate,
			'' [BrokerageName],
			'' [SchemeName],
			'' [ParentPolicyNumber],
			0 [MissingPolicies]
		from bpm.Wizard w (nolock)
			inner join common.WizardStatus ws (nolock) on ws.Id = w.WizardStatusId
		where w.WizardConfigurationId = 24
			and w.WizardStatusId = 2
			and w.CreatedDate >= isnull(@startDate, '2000-01-01')

	-- Temporary table for member details
	declare @member table (
		MemberId int identity,
		WizardId int,
		BrokerageId int,
		ParentPolicyId int,
		ParentPolicyNumber varchar(32),
		CompanyName varchar(128),
		LoadPolicyId int,
		LoadRolePlayerId int,
		MemberName varchar(128),
		IdNumber varchar(64),
		PolicyId int,
		RolePlayerId int
	)

	-- Get all the MAIN MEMBERS only, because we want to find missing policies
	insert into @member (WizardId, BrokerageId, ParentPolicyId, ParentPolicyNumber, CompanyName, LoadPolicyId, LoadRolePlayerId, MemberName, IdNumber)
		select distinct w.WizardId,
			p.BrokerageId,
			p.PolicyId [ParentPolicyId],
			co.PolicyNumber [ParentPolicyNumber],
			co.CompanyName,
			m.PolicyId [LoadPolicyId],
			m.RolePlayerId [LoadRolePlayerId],
			m.MemberName,
			m.IdNumber
		from @wizard w
			inner join Load.PremiumListingCompany co (nolock) on co.FileIdentifier = w.FileIdentifier
			inner join Load.PremiumListingMember m (nolock) on m.FileIdentifier = w.FileIdentifier
			inner join policy.Policy p (nolock) on p.PolicyNumber = co.PolicyNumber
		where p.PolicyStatusId not in (2, 4, 5, 10, 13) -- Exclude inactive schemes
		  and m.CoverMemberTypeId = 1
		order by w.WizardId

	-- Remove the main members with existing PolicyId's and RolePlayerId's - they exist in the system
	delete from @member where LoadPolicyId > 0 and LoadRolePlayerId > 0

	-- Find roleplayers that already exist in the system
	update m set m.RolePlayerId = per.RolePlayerId from @member m inner join client.Person per (nolock) on per.IdNumber = m.IdNumber

	-- Find policies that already exist in the system
	update m set m.PolicyId = p.PolicyId from @member m inner join policy.Policy p on p.ParentPolicyId = m.ParentPolicyId and p.PolicyOwnerId = m.RolePlayerId

	-- Again remove the main members with existing PolicyId's and RolePlayerId's - they exist in the system
	delete from @member where PolicyId > 0 and RolePlayerId > 0

	-- Remove duplicate members for the same parent policies
	delete m from @member m inner join (
		select ParentPolicyId, IdNumber, max(MemberId) [MemberId], count(*) [Members] from @member group by ParentPolicyId, IdNumber having count(*) > 1
	) t on t.ParentPolicyId = m.ParentPolicyId and t.IdNumber = m.IdNumber and t.MemberId <> m.MemberId

	-- Update the missing policy details in the wizard table
	update w set
		w.BrokerageName = upper(t.Brokerage),
		w.SchemeName = upper(t.CompanyName),
		w.ParentPolicyNumber = t.ParentPolicyNumber,
		w.MissingPolicies = t.Policies
	from @wizard w inner join (
		select m.WizardId,
			b.[Name] [Brokerage],
			m.CompanyName,
			m.ParentPolicyNumber,
			count(*) [Policies]
		from @member m
			inner join broker.Brokerage b (nolock) on b.Id = m.BrokerageId
		group by m.WizardId, b.[Name], m.CompanyName, m.ParentPolicyNumber
	) t on t.WizardId = w.WizardId

	-- Final result set
	select SchemeName [Scheme],
		BrokerageName [Brokerage],
		ParentPolicyNumber,
		WizardName,
		CreatedDate [WizardCreatedDate],
		MissingPolicies
	from @wizard
	where MissingPolicies > 0
	order by SchemeName,
		CreatedDate

END