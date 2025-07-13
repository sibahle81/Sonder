CREATE PROCEDURE [claim].[ClaimReport]
	@DateFrom As Date,
	@DateTo AS Date,
	@ClaimStatusId As INT = 0
AS
	BEGIN
		SELECT DISTINCT
			clm.Id As Id,
			clm.CreatedDate AS 'DateRegistered', 
			pol.InceptionDate AS 'DateOfCommencement', 
			NULL AS 'Channel', 
			cod.Name AS 'TypeOfDeath', 
			fdr.FirstName AS 'DeseasedName', 
			fdr.LastName AS 'DeseasedSurname', 
			pol.PolicyNumber AS 'PolicyNumber', 
			coms.BrokerageName AS 'Brokerage', 
			comd.BrokerId AS 'BrokerNumber', 
			/*br.BenefitAmount*/ null AS 'BenefitAmount', 
			fdr.DateOfDeath AS 'DateOfDeath', 
			prd.[Name] AS 'Product', 
			cnt.[Name] AS 'CompanyName', 
			comd.BrokerName AS 'Broker', 
			NULL AS 'Scheme', 
			clm.ClaimUniqueReference AS 'ClaimNumber', 
			clm.ModifiedBy AS 'User',
			cls.Name As 'ClaimStatus',
			cls.Id As 'StatusId',
			u.DisplayName As 'Assessor',
			py.PaymentConfirmationDate As 'PaymentDate',
			py.Amount As 'AmountPaid'
		FROM 
			[claim].[Claim] (NOLOCK) clm 
			INNER JOIN [claim].[FuneralRegistryDetails] (NOLOCK) fdr ON fdr.ClaimId = clm.Id
			INNER JOIN [policy].[Policy] (NOLOCK) pol ON clm.PolicyId = pol.Id
			INNER JOIN [client].[Client] (NOLOCK) cnt ON pol.ClientId = cnt.Id
			INNER JOIN [claim].[ClaimStatus] cls ON clm.ClaimStatusId = cls.Id
			INNER JOIN [security].[User] (NOLOCK) u ON clm.AssignedToUserId = u.Id
			LEFT JOIN [claim].[CauseOfDeathType] (NOLOCK) cod ON fdr.CauseOfDeathId = cod.Id
			LEFT JOIN [claim].[ClaimPayment] (NOLOCK) cp ON cp.ClaimId = clm.Id
			LEFT JOIN [payment].[Payment] (NOLOCK) py ON cp.PaymentId = py.Id
			LEFT JOIN [policy].[CommissionDetail] (NOLOCK) comd ON comd.PolicyId = pol.Id
			LEFT JOIN [policy].[CommissionSummary] (NOLOCK) coms ON comd.CommissionSummaryId = coms.Id
			INNER JOIN [policy].[ClientCover] (NOLOCK) cvr ON cvr.PolicyId = pol.Id AND cvr.ClientId = cnt.Id
			INNER JOIN [product].[Product] (NOLOCK) prd ON cvr.ProductId = prd.Id
			INNER JOIN [product].[ProductOption] (NOLOCK) prdo ON prdo.ProductId = prd.Id
			INNER JOIN [product].[ProductOptionBenefit] (NOLOCK) pob ON pob.ProductOptionId = prdo.Id
			INNER JOIN [product].[BenefitRate] (NOLOCK) br ON pob.BenefitId = br.BenefitId
		WHERE
			clm.CreatedDate BETWEEN @DateFrom AND @DateTo AND
			(@ClaimStatusId = 0 OR clm.ClaimStatusId IN (SELECT Id FROM [claim].[ClaimStatus] (NOLOCK)
														 WHERE [Status] IN (SELECT [Status] 
																		  FROM [claim].[ClaimStatus] (NOLOCK) WHERE Id = @ClaimStatusId)))
		ORDER BY clm.CreatedDate DESC
	END
