CREATE PROCEDURE [policy].[MonthlyPolicyPerBrokerReport]      
    @Brokerage int,
    @Group int
AS BEGIN

	declare @brokerageId int = @Brokerage
	declare @companyId int = @Group

	IF isnull(@brokerageId, 0) = 0 BEGIN
		SET @brokerageId = NULL;
	END

	IF isnull(@companyId, 0) = 0 BEGIN
		SET @companyId = NULL;
	END

	select child.PolicyNumber,
		child.PolicyInceptionDate [InceptionDate],
		co.[Name] [Schemename],
		b.[Name] [BrokerName],
		per.FirstName [Name],
		per.Surname,
		per.IdNumber,
		pm.[Name] [PaymentMethod],
		pf.[Name] [PremiumFrequency],
		ps.[Name] [Status],
		case isnull(pam.[DoRaiseInstallementPremiums], 0)
			when 1 then child.[InstallmentPremium] 
			else 0.00 
		end [CurrentPremium],
		child.[CancellationDate] [DateCancelled],
		cr.[Name] [CancelReason],
		per.DateOfDeath [DeathDate],
		ct.[Description] [ClientType]
	from policy.Policy p (nolock)
		inner join client.Company co (nolock) on co.RolePlayerId = p.PolicyOwnerId
		inner join broker.Brokerage b (nolock) on b.Id = p.BrokerageId
		inner join product.ProductOption po (nolock) on po.Id = p.ProductOptionId
		inner join policy.Policy child (nolock) on child.ParentPolicyId = p.PolicyId
		inner join client.Person per (nolock) on per.RolePlayerId = child.PolicyOwnerId
		inner join common.PolicyStatus ps (nolock) on ps.Id = child.PolicyStatusId
		inner join common.PaymentMethod pm (nolock) on pm.Id = child.PaymentMethodId
		inner join common.PaymentFrequency pf (nolock) on pf.Id = child.PaymentFrequencyId
		inner join common.CoverType ct (nolock) on po.CoverTypeId = ct.Id
		left join policy.PolicyStatusActionsMatrix pam (nolock) on pam.PolicyStatus = child.PolicyStatusId
		left join common.PolicyCancelReason cr (nolock) on cr.Id = child.[PolicyCancelReasonId]
	where co.RolePlayerId = isnull(@companyId, co.RolePlayerId)
	  and b.Id = isnull(@brokerageId, b.Id)
	  -- Exclude inactive scheme policies
	  and p.PolicyStatusId not in (2, 4, 5, 7, 13) -- select * from common.PolicyStatus order by Id
	order by child.PolicyInceptionDate,
		child.PolicyNumber

END
