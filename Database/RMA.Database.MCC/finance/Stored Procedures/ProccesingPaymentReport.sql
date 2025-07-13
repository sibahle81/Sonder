



CREATE PROCEDURE [finance].[ProccesingPaymentReport]
	@StartDate DATE,
	@EndDate DATE

 AS

 BEGIN

SELECT DISTINCT 
pay.[paymentID]					as [paymentID]
,pay.[Reference]				as [Payment Reference]
,ab.[BatchReference]	     	as [Batch No]
,pay.[CreatedDate]				as [Authorised DATE]
,pay.[SubmissionDate]			as [Payment DATE]
,pay.[Company]					as [Company]
,pay.[Branch]					as [Branch]
,pay.[Payee]					as [Payee Details]
,pay.[ClaimReference]			as [Claim No]
,pay.[PolicyReference]			as [Policy No]
,pay.[Amount]					as [Amount]
,pay.[PaymentId]				as [Payment transaction]
,pay.[AccountNo]				as [Account Details]
,pay.[SENDerAccountNo]			as [SENDerAccountNo]
,ct.[Description]				as [Product]
,pt.[Name]						as [Payment Type] 
,ps.[Name]						as [Payment Status]
,clmt.[Name]					as [Claim Type] 
,prc.[BriefDescription]			as [Error Description]
,CASE WHEN pay.PaymentTypeId = 7 THEN pay.[Reference] ELSE '' END AS PensionNumber
,rp.[DisplayName] [Scheme]
,bro.Name [BrokerName] 
,ab.[ChartBSNo] [Chart number]
,bse.[UserReference] [BankStatementReference] 



FROM [payment].[payment] pay
INNER JOIN [Common].[PaymentType] pt (NOLOCK) ON pay.[PaymentTypeId] = pt.[Id]
INNER JOIN [Common].[PaymentStatus] ps (NOLOCK) ON pay.[PaymentStatusId] = ps.Id
INNER JOIN [policy].[policy] pol (NOLOCK) ON pay.[PolicyId] = pol.[Policyid]
INNER JOIN [product].[ProductOptionCoverType] poct (NOLOCK) ON pol.[ProductOptionId] = poct.[ProductOptionId]
INNER JOIN [common].[CoverType] ct (NOLOCK) ON poct.[CoverTypeId] = ct.[Id]
LEFT JOIN [common].[ClaimType] clmt(NOLOCK) ON clmt.[Id] = pay.[ClaimTypeId]
LEFT JOIN [payment].[PaymentRejectionCode] prc (NOLOCK) ON pay.[ErrorCode] = prc.[Code] 
AND prc.[IsDeleted] = 0 AND prc.[IsActive] = 1		
LEFT JOIN [client].[roleplayer] rp (NOLOCK) ON rp.RolePlayerId = pol.[policyOwnerId]
LEFT JOIN [broker].[Brokerage] bro (NOLOCK) ON pol.[BrokerageId] = bro.[Id]
LEFT JOIN [finance].[AbilityPosting] ab (NOLOCK) ON convert(varchar(20),pay.Branch) = convert(varchar(20),ab.[BranchNo])
LEFT JOIN [payment].[FacsTransactionResults] facs (NOLOCK) ON facs.[PaymentId] = pay.[PaymentId]
LEFT JOIN [finance].[BankStatementEntry] bse (NOLOCK)
ON Convert(INT,bse.[RequisitionNumber ]) = Convert(INT,facs.[RequisitionNumber ])
WHERE pay.[SubmissionDate] BETWEEN @StartDate AND @EndDate 




END