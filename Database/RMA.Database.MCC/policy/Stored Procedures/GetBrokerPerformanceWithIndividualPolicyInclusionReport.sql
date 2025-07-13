
-- =============================================
-- Author:		Lucky Khoza
-- Create date: 2024-07-31
-- EXEC [policy].[GetBrokerPerformanceWithIndividualPolicyInclusionReport] 'July', 2024
-- =============================================
CREATE PROCEDURE [policy].[GetBrokerPerformanceWithIndividualPolicyInclusionReport]
	@ReportingMonth VARCHAR(30),
	@ReportingYear INT
AS
BEGIN
	declare @policy table (
	Brokerage varchar(128),
	Scheme varchar(128),
	Policies int,
	Lives int,
	Premium money
)

insert into @policy ([Brokerage], [Scheme], [Policies], [Lives], [Premium] )
	select upper(b.[Name]) [Brokerage],
		upper(co.[Name]) [Scheme],
		count(distinct c.PolicyId) [Policies],
		count(pil.RolePlayerId) [Members],
		p.InstallmentPremium [Premium]
	from broker.Brokerage b (nolock)
		inner join policy.Policy p (nolock) on p.BrokerageId = b.Id
		inner join client.Company co (nolock) on co.RolePlayerId = p.PolicyOwnerId
		inner join policy.Policy c (nolock) on c.ParentPolicyId = p.PolicyId
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = c.PolicyId
	where p.PolicyStatusId not in (2, 4, 5, 13)
	  and c.PolicyStatusId not in (2, 4, 5, 13)
	  and left(c.PolicyNumber, 3) = '01-'
	  and pil.InsuredLifeStatusId = 1
	  and p.PaymentFrequencyId = 2 
	  and DATENAME(MM, p.CreatedDate)  = @ReportingMonth
	  and YEAR(p.CreatedDate) = @ReportingYear
	group by b.[Name],
		p.PolicyId,
		co.[Name],
		p.InstallmentPremium

insert into @policy ([Brokerage], [Scheme], [Policies], [Lives], [Premium])
	select b.Name [Brokerage],
		'Individual' [Scheme],
		count(distinct p.PolicyId) [Policies],
		count(pil.RolePlayerId) [Members],
		sum(case when pil.RolePlayerTypeId = 10 then p.InstallmentPremium else 0.00 end) [Premium]
	from broker.Brokerage b (nolock)
		inner join policy.Policy p (nolock) on p.BrokerageId = b.Id
		inner join client.RolePlayer rp (nolock) on rp.RolePlayerId = p.PolicyOwnerId
		inner join policy.PolicyInsuredLives pil (nolock) on pil.PolicyId = p.PolicyId
	where p.PolicyStatusId not in (2, 4, 5, 13)
		and p.ParentPolicyId is null
		and left(p.PolicyNumber, 3) = '01-'
		and rp.RolePlayerIdentificationTypeId = 1
		and pil.InsuredLifeStatusId = 1
		and p.PaymentFrequencyId = 2 
		and DATENAME(MM, p.CreatedDate)  = @ReportingMonth
	    and YEAR(p.CreatedDate) = @ReportingYear
	group by b.[Name]

	select * from (
	select [Brokerage],	
		sum(case [Scheme] when 'Individual' then 0 else 1 end) [Schemes],
		sum(Policies) [Policies],
		sum(Lives) [Lives],
		cast(sum(Premium) as money) [Premium]
	from @policy 
	group by [Brokerage]
) t order by [Premium] desc

END
