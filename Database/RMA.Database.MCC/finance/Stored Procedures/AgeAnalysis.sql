
CREATE PROCEDURE [finance].[AgeAnalysis]
	@StartDate DATE, 
	@EndDate DATE
AS

SELECT DISTINCT 
CONVERT(DATE,INV.[CreatedDate]) AS [Date] 
,IC.Name AS [Industry Class]
,[AUDIT].Status AS [Debtor Status]
,CT.Name AS [Client Type]
,'DR' AS [Balance Type]
,PRO.Name AS [Product]
,case when CAST(DATEDIFF(day, (INV.InvoiceDate), COALESCE((INV.ModifiedDate), GETDATE())) AS VARCHAR) > 30 
and CAST(DATEDIFF(day, (INV.InvoiceDate), COALESCE((INV.ModifiedDate), GETDATE())) AS VARCHAR) < 60 then '30 days'  
when CAST(DATEDIFF(day, (INV.InvoiceDate), COALESCE((INV.ModifiedDate), GETDATE())) AS VARCHAR) > 60 
and CAST(DATEDIFF(day, (INV.InvoiceDate), COALESCE((INV.ModifiedDate), GETDATE())) AS VARCHAR) < 90 then '60 days'
when CAST(DATEDIFF(day, (INV.InvoiceDate), COALESCE((INV.ModifiedDate), GETDATE())) AS VARCHAR) > 90 
and CAST(DATEDIFF(day, (INV.InvoiceDate), COALESCE((INV.ModifiedDate), GETDATE())) AS VARCHAR) < 120 then '90 days'
when CAST(DATEDIFF(day, (INV.InvoiceDate), COALESCE((INV.ModifiedDate), GETDATE())) AS VARCHAR) > 120 then '120 days'
else '0 days' end AS Duration
FROM [AZT-MCC].[billing].[Invoice] INV
INNER JOIN common.SLAStatusChangeAudit [AUDIT] ON INV.PolicyId = [AUDIT].ItemId 
INNER JOIN [POLICY].[Policy] POL ON INV.PolicyId = POL.PolicyId
INNER JOIN CLIENT.[Company] COP ON POL.PolicyPayeeId = COP.RolePlayerId
INNER JOIN  [common].IndustryClass IC ON COP.IndustryClassId = IC.Id 
INNER JOIN CLIENT.[RolePlayer] RP ON COP.RolePlayerId = RP.RolePlayerId
INNER JOIN [common].ClientType CT ON RP.ClientTypeId = CT.Id
INNER JOIN product.ProductOption PO ON POL.ProductOptionId = PO.Id
INNER JOIN product.Product PRO ON PO.ProductId = PRO.Id
WHERE INV.[CreatedDate] BETWEEN @StartDate AND @EndDate