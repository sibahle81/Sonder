
CREATE PROCEDURE [policy].[ExpenseBasedPolicyScheduleDB]
	@PolicyId INT 
	AS

--Declare @PolicyId INT 
--Set @PolicyId = 22492 


BEGIN

SELECT TOP 1 
	pp.PolicyId,
	pp.TenantId,
	pp.QuoteId,
	pp.ProductOptionId,
	pp.PolicyOwnerId,
	(Select DisplayName from [client].[RolePlayer] where RolePlayerId = pp.PolicyOwnerId) as 'PolicyOwner',
	(Select [Name] from [client].[Company] where RolePlayerId = pp.PolicyOwnerId) as 'ClientName',
	--(Select DisplayName from [client].[RolePlayer] where RolePlayerId = pp.PolicyPayeeId) as 'PolicyPayeeId',
	pp.PolicyPayeeId,
	(Select [Name] from common.PaymentFrequency where Id = pp.PaymentFrequencyId) as 'PaymentFrequency',
	(Select [Name] from common.PaymentMethod where Id = pp.PaymentMethodId) as 'PaymentMethod',
	pp.PolicyNumber,
	pp.PolicyInceptionDate,
	pp.ExpiryDate,
	pp.CancellationInitiatedDate as 'CancellationDate',
	pp.FirstInstallmentDate,
	pp.LastInstallmentDate,
	pp.RegularInstallmentDayOfMonth,
	pp.DecemberInstallmentDayOfMonth as 'DdecemberInstallmentDayOfMonth',
	(Select [Name] from [common].[PolicyStatus] where Id = pp.PolicyStatusId) as 'PolicyStatus',
	pp.AnnualPremium,
	pp.InstallmentPremium,
	pp.AdminPercentage,
	pp.CommissionPercentage,
	pp.BinderFeePercentage,
	pp.IsDeleted,
	pp.CreatedBy,
	pp.CreatedDate,
	pp.ModifiedBy,
	pp.ModifiedDate,
	pp.PolicyCancelReasonId,
	pp.ClientReference,
	pp.LastLapsedDate,
	pp.LapsedCount,
	pp.LastReinstateDate,
	(Select [Name] from [product].ProductOption where Id = pp.ProductOptionId) as 'ProductOption',
	pp.policyMovementId,
	pp.ParentPolicyId,
	pp.PaymentFrequencyId,
	pp.PaymentMethodId,
	pp.PolicyStatusId,
	pp.CanLapse,
	crp.DisplayName,
	crp.EmailAddress,
	IsNaturalEntity = CASE WHEN crp.[RolePlayerIdentificationTypeId] = 1 then 1 else 0 end,
	crp.RolePlayerId,
	cc.Name as 'CompanyName',
	crpc.ContactNumber,
	crpc.Firstname,
	crpc.Surname,
	cic.Name as 'IndustryClass',
	ci.Name as 'Industry',
	(Select [Name] from [common].RolePlayerBenefitWaitingPeriod where Id = crp.RolePlayerBenefitWaitingPeriodId) as 'RolePlayerBenefitWaitingPeriod'
	from [policy].[Policy] pp
	Inner Join [client].[RolePlayer] crp On crp.RolePlayerId = pp.PolicyOwnerId
	Left Join [client].[Company] cc On cc.RolePlayerId = crp.RolePlayerId
	Left Join [client].[RolePlayerContact] crpc On crpc.RolePlayerId = crp.RolePlayerId
	Left Join [common].[IndustryClass] cic On cic.Id = cc.IndustryClassId
	Left Join [common].[Industry] ci On ci.Id = cc.IndustryId
	where pp.PolicyId = @PolicyId
	
END