


-- ============================================================================
-- Author:	Farai Nyamajiwa
-- Create date: 2020-11-05
-- Description:	[Billing].[CommissionComplianceReport] '2018-01-01','2020-11-30'
-- ============================================================================

CREATE PROCEDURE [billing].[CommissionComplianceReport]
	@StartDate As Date,
	@EndDate AS Date
	
AS
BEGIN
	
	IF OBJECT_ID(N'tempdb..#TempCommissions', N'U') IS NOT NULL
		DROP TABLE #TempCommissions;


		select 
				ch.RecepientId,
				ch.RecepientCode,
				ch.RecepientName,
				ch.FitAndProperCheckDate,
				ch.TotalHeaderAmount,
				cd.PolicyNumber,
				cd.AllocatedAmount,
				cd.CommissionAmount,
				cd.AdminServiceFeeAmount,
				cd.CreatedDate,
				crt.Name AS RepType,
				rr.Name AS RepRole,
				bb.LegalCapacity,
				bb.Name As Brokerage,
				CASE WHEN bb.Name NOT LIKE  '%Rand Mutual%' THEN 'BROKER'
				     WHEN bb.Name LIKE  '%Rand Mutual%' THEN 'RMA INTERNAL STAFF'
				END AS Broker
		INTO #TempCommissions
		FROM [commission].[Header] ch
		LEFT JOIN [commission].[Detail] cd ON ch.HeaderId = cd.HeaderId
		LEFT JOIN [broker].[Representative] br ON cd.RepCode = br.Code
		LEFT JOIN [broker].[BrokerageRepresentative] bbr ON br.Id = bbr.RepresentativeId
		LEFT JOIN [broker].[Brokerage] bb ON bbr.BrokerageId = bb.[Id]
		LEFT JOIN [common].[RepType] crt ON br.RepTypeId = crt.[Id]
		LEFT JOIN [common].[RepRole] rr ON bbr.RepRoleId = rr.[Id]
		where br.[IsDeleted] = 0
		AND bbr.[IsDeleted] = 0
		AND cd.CreatedDate BETWEEN @StartDate AND @EndDate 
	
   


		SELECT 
				CASE WHEN RepRole LIKE 'Key Individual' THEN 'Face-to-face by insurer’s own individual representatives (“tied agents”);'
					 WHEN RepRole LIKE 'Representative' THEN 'Face-to-face by insurer"s juristic representatives; '
					 WHEN RepRole LIKE 'Sole Proprietor' THEN 'Face-to-face by independent intermediaries (FSP’s that are not representatives of the insurer);'
					 ELSE 'Other' END AS Communication,
		        
				CASE WHEN RepType LIKE 'Juristic' THEN 'Juristic'
					 WHEN RepType NOT LIKE 'Juristic' AND LegalCapacity = 'Natural Person' THEN 'Individually risk rated'
					 WHEN RepType NOT LIKE 'Juristic' AND LegalCapacity = 'Company' THEN 'Individually underwritten on a group basis'
					 ELSE 'Other' END AS Underwritter,
				CommissionAmount,
				CreatedDate
		FROM #TempCommissions
END
GO


