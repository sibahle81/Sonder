CREATE PROCEDURE [billing].[CommisionStatementBrokeragePaymentDetails]
	@StartDate DateTime, 
	@EndDate DateTime,
	@BrokerageId int
AS
Begin
DECLARE @BrokerageAmounts TABLE (
				[StartPeriod] DateTime,
				[Reference]  VARCHAR(150), 
				[TransactionType]  VARCHAR(150), 
				[Amount] MONEY
		);


INSERT @BrokerageAmounts
SELECT    DISTINCT
    pins.[CreatedDate] AS [CreatedDate], 
    pm.[Reference] AS [Reference],
    CASE WHEN (1 = pins.[CommissionPaymentTypeId]) THEN N'Commission Paid' ELSE N'ISF Paid' END AS TransactionType, 
    pm.[Amount] AS [Amount]
    FROM   [commission].[PaymentInstruction] AS pins
    INNER JOIN [commission].[Header] AS h ON pins.[HeaderId] = h.[HeaderId]
	INNER JOIN [commission].[Detail] as d on h.[headerId] = d.[headerid]
	INNER JOIN commission.[Period] p on p.PeriodId = h.PeriodId
    INNER JOIN [payment].[Payment] AS pm ON pins.[PaymentInstructionId] = pm.[PaymentInstructionId]
    WHERE ((pins.[IsDeleted] = 0) ) AND ((pins.[IsDeleted] = 0) ) AND ((pins.[IsDeleted] = 0) ) AND ((h.[IsDeleted] = 0) ) AND ((h.[IsDeleted] = 0) ) AND ((h.[IsDeleted] = 0) ) AND ((pm.[IsDeleted] = 0) ) 
	AND ((pm.[IsDeleted] = 0) ) AND ((pm.[IsDeleted] = 0) ) 
	AND (h.PeriodId in (Select PeriodId from commission.[Period] where StartDate >= @StartDate or EndDate >= @EndDate))
	AND (h.[RecepientId] = @brokerageId) 
	AND pm.PaymentConfirmationDate is not null
UNION 
	SELECT    DISTINCT
    h.[CreatedDate] AS [CreatedDate], 
    '' AS [Reference], 
      N'Commission Withheld (' + case when  cr.[Name] is null then  ISNULL(h.Comment,'User Withheld') else cr.[Name] end  +')'  AS TransactionType, 
    -1 * h.totalheaderAmount AS [Amount]
    FROM  [commission].[Header] h (nolock)
	INNER JOIN commission.[Period] p on p.PeriodId = h.PeriodId
	INNER JOIN [commission].[Detail] as d on h.[headerId] = d.[headerid]
	LEFT JOIN [common].[CommissionWithholdingReason] cr on cr.Id = h.WithholdingReasonId
    WHERE   ((h.[IsDeleted] = 0) ) AND ((h.[IsDeleted] = 0) )	 
	AND (h.[RecepientId] = @brokerageId) 
	AND (h.PeriodId in (Select PeriodId from commission.[Period] where StartDate >= @StartDate or EndDate >= @EndDate))
	AND h.HeaderStatusId = 4

ORDER BY 4 DESC

Select [StartPeriod],
	   [Reference], 
	   [TransactionType], 
	   [Amount]
	FROM @BrokerageAmounts
END
