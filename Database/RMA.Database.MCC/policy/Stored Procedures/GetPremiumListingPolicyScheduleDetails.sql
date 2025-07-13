CREATE PROCEDURE [policy].[GetPremiumListingPolicyScheduleDetails] @wizardId int = null, @policyId int = null
AS
BEGIN
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

		declare @address table (
			RolePlayerId int,
			AddressLine1 varchar(128),
			AddressLine2 varchar(128)
		)

		insert into @address
			select rolePlayerId,
				addressLine1,
				concat(addressLine2, ', ', postalcode) [addressLine2]
			from openjson(@json, concat(@mainMemberSection, '.rolePlayerAddresses'))
			with (
				rolePlayerId int,
				addressType int,
				addressLine1 varchar(100),
				addressLine2 varchar(100),
				postalCode varchar(20),
				city varchar(50)
			) a
			where a.addressType = 2

		select top 1 @mainMemberId = RolePlayerId from @address

		declare @benefit table (
			RolePlayerId int,
			BenefitId int,
			Premium money,
			CoverAmount money
		)

		insert into @benefit
			select @mainMemberId,
				id,
				benefitBaseRateLatest,
				benefitRateLatest
			from openjson(@json, concat(@mainMemberSection, '.benefits'))
			with (
				id int,
				benefitType int,
				benefitBaseRateLatest money,
				benefitRateLatest money
			) b
			where b.benefitType = 1

		select distinct p.PolicyId,
				p.PolicyNumber,
				ps.[Name] [PolicyStatus],
				p.PolicyInceptionDate,
				p.IssueDate,
				client.GetNextBirthDay(p.PolicyInceptionDate) [AnniversaryDate],
				iif(p.ExpiryDate is null, 'Whole Life', 'Term Life') [Term],
				cast(getdate() as date) [ScheduleDate],
				cast(dateadd(hour, 12, p.FirstInstallmentDate) as date) [FirstInstallmentDate],
				p.Premium,
				pf.[Name] [PaymentFrequency],
				pm.[Name] [PaymentMethod],
				p.CollectionDay,
				ben.CoverAmount,
				b.BrokerageName,
				concat(r.FirstName, ' ', r.Surname) [Representative],
				p.MainMember,
				p.IdNumber,
				p.DateOfBirth,
				p.StartDate,
				p.CellNumber,
				p.EmailAddress,
				a.AddressLine1 [AddressLine1],
				a.AddressLine2 [AddressLine2],
				p.MainMember [PolicyPayer],
				p.IdNumber [PayerIdNumber],
				p.DateOfBirth [PayerDateOfBirth],
				p.CellNumber [PayerCellNumber],
				p.EmailAddress [PayerEmailAddress],
				a.AddressLine1 [PayerAddressLine1],
				a.AddressLine2 [PayerAddressLine2]
			from openjson(@json, @mainMemberSection) 
				with (
					PolicyId int '$.policies[0].policyId',
					PolicyNumber varchar(32) '$.policies[0].policyNumber',
					PolicyInceptionDate date '$.policies[0].policyInceptionDate',
					IssueDate date '$.policies[0].createdDate',
					PolicyStatusId int '$.policies[0].policyStatus',
					PaymentFrequencyId int '$.policies[0].paymentFrequency',
					PaymentMethodId int '$.policies[0].paymentMethod',
					CollectionDay int '$.policies[0].regularInstallmentDayOfMonth',
					RolePlayerId int '$.rolePlayerId',
					MainMember varchar(128) '$.displayName',
					DateOfBirth date '$.person.dateOfBirth',
					IdNumber varchar(64) '$.person.idNumber',
					StartDate date '$.joinDate',
					ExpiryDate date '$.expiryDate',
					CellNumber varchar(32) '$.cellNumber',
					EmailAddress varchar(128) '$.emailAddress',
					FirstInstallmentDate datetime '$.policies[0].firstInstallmentDate',
					Premium money '$.policies[0].installmentPremium'
				) p
				outer apply openjson(@json, '$[0].brokerage')
				with (
					BrokerageName varchar(128) '$.name'
				) b
				outer apply openjson(@json, '$[0].representative')
				with (
					FirstName varchar(64) '$.firstName',
					Surname varchar(64) '$.surnameOrCompanyName'
				) r
				left join common.PolicyStatus ps (nolock) on ps.Id = p.PolicyStatusId
				left join common.PaymentFrequency pf (nolock) on pf.Id = p.PaymentFrequencyId
				left join common.PaymentMethod pm (nolock) on pm.Id = p.PaymentMethodId
				left join @address a on a.RolePlayerId = p.RolePlayerId
				left join @benefit ben on ben.RolePlayerId = p.RolePlayerId
	end else begin
		select p.PolicyId,
			p.PolicyNumber,
			ps.[Name] [PolicyStatus],
			p.PolicyInceptionDate,
			cast(p.CreatedDate as date) [IssueDate],
			client.GetNextBirthDay(p.PolicyInceptionDate) [AnniversaryDate],
			iif(p.ExpiryDate is null, 'Whole Life', 'Term Life') [Term],
			cast(getdate() as date) [ScheduleDate],
			p.FirstInstallmentDate,
			cast(p.InstallmentPremium as money) [Premium],
			pf.Name [PaymentFrequency],
			pm.Name [PaymentMethod],
			p.RegularInstallmentDayOfMonth [CollectionDay],
			ben.BenefitAmount [CoverAmount],
			b.[Name] [BrokerageName],
			concat(r.FirstName, ' ', r.SurnameOrCompanyName) [Representative],
			concat(per.FirstName, ' ', per.Surname) [MainMember],
			per.IdNumber,
			per.DateOfBirth,
			cast(pil.StartDate as date) [StartDate],
			rp.CellNumber,
			rp.EmailAddress,
			oa.AddressLine1 [AddressLine1],
			oa.AddressLine2 [AddressLine2],
			pp.DisplayName [PolicyPayer],
			payer.IdNumber [PayerIdNumber],
			payer.DateOfBirth [PayerDateOfBirth],
			pp.CellNumber [PayerCellNumber],
			pp.EmailAddress [PayerEmailAddress],
			pa.AddressLine1 [PayerAddressLine1],
			pa.AddressLine2 [PayerAddressLine2]
		from policy.Policy p (nolock)
			inner join common.PolicyStatus ps (nolock) on ps.Id = p.PolicyStatusId
			inner join common.PaymentFrequency pf (nolock) on pf.Id = p.PaymentFrequencyId
			inner join common.PaymentMethod pm (nolock) on pm.Id = p.PaymentMethodId
			inner join broker.Brokerage b (nolock) on b.Id = p.BrokerageId
			inner join broker.Representative r (nolock) on r.Id = p.RepresentativeId			
			inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId and pil.RolePlayerTypeId = 10
			inner join [product].[CurrentBenefitRate] ben on ben.BenefitId = pil.StatedBenefitId
			inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
			inner join client.Person per (nolock) on per.RolePlayerId = p.PolicyOwnerId
			inner join client.RolePlayer pp (nolock) on pp.RolePlayerId = p.PolicyPayeeId
			inner join client.Person payer (nolock) on payer.RolePlayerId = pp.RolePlayerId
			left join (
				select a.RolePlayerId,
					a.AddressLine1,
					concat(a.AddressLine2, ', ', a.PostalCode) [AddressLine2],
					rank() over (partition by a.RolePlayerId order by a.CreatedDate desc) [Rank]
				from policy.Policy p (nolock)
					inner join client.RolePlayerAddress a (nolock) on a.RolePlayerId = p.PolicyOwnerId
				where p.PolicyId = @policyId
				  and a.IsDeleted = 0
				  and a.AddressTypeId = 2
			) oa on oa.RolePlayerId = rp.RolePlayerId and oa.[Rank] = 1
			left join (
				select a.RolePlayerId,
					a.AddressLine1,
					concat(a.AddressLine2, ', ', a.PostalCode) [AddressLine2],
					rank() over (partition by a.RolePlayerId order by a.CreatedDate desc) [Rank]
				from policy.Policy p (nolock)
					inner join client.RolePlayerAddress a (nolock) on a.RolePlayerId = p.PolicyOwnerId
				where p.PolicyId = @policyId
				  and a.IsDeleted = 0
				  and a.AddressTypeId = 2
			) pa on pa.RolePlayerId = payer.RolePlayerId and pa.[Rank] = 1
		where p.PolicyId = @policyId
		  and pil.InsuredLifeStatusId = 1
	end
END
GO
