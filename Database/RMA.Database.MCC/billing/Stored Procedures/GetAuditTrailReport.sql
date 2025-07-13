CREATE PROCEDURE [finance].[GetAuditTrailReport]
	@StartDate DATE,
	@EndDate DATE
AS
BEGIN
	 SELECT [A].[ItemId] [PaymentId],
	JSON_VALUE(NewItem,'$.Reference') [Reference],
	[A].[Username] [EmailAddress],
    [S].Name AS [Status],
	JSON_VALUE(NewItem,'$.Product') [Product],
	JSON_VALUE(NewItem,'$.ClaimReference') [ClaimReference],
	JSON_VALUE(NewItem,'$.Reference') [Reference],
	[PT].Name [Type],
	JSON_VALUE(NewItem,'$.Payee') [Payee],
	JSON_VALUE(NewItem,'$.Bank') [AccountNo],
	JSON_VALUE(NewItem,'$.Amount') [Amount],

	[Appr].EndDateTime [Approved_Date],
	[Auth].EndDateTime [Authorised_Date],

	JSON_VALUE(NewItem,'$.CreatedDate') [Pending_Date],
	JSON_VALUE(NewItem,'$.SubmissionDate') [SubmissionDate],
	JSON_VALUE(NewItem,'$.PaymentConfirmationDate') [PaymentConfirmationDate],
	JSON_VALUE(NewItem,'$.ReconciliationDate') [ReconciliationDate],
	JSON_VALUE(NewItem,'$.RejectionDate') [RejectionDate],
	JSON_VALUE(NewItem,'$.ClientNotificationDate') [Letter_Date],
    case when [PT].[name] in ('Medical Invoice','Claim', 'Funeral') OR JSON_VALUE(NewItem,'$.Product') in ('Individual') then 
               case when DATEDIFF(hour, JSON_VALUE(NewItem,'$.SubmissionDate'), JSON_VALUE(NewItem,'$.ModifiedDate')) <= 24 then 'IN' else 'OUT'  end
         when [PT].[name] in ('Capital Value','Tribunal') then
               CASE WHEN DATEPART(YEAR,JSON_VALUE(NewItem,'$.SubmissionDate')) = DATEPART(YEAR,JSON_VALUE(NewItem,'$.ModifiedDate')) 
                 AND DATEPART(MONTH,JSON_VALUE(NewItem,'$.SubmissionDate')) = DATEPART(MONTH,JSON_VALUE(NewItem,'$.ModifiedDate')) 
                 AND DATEPART(WEEK,JSON_VALUE(NewItem,'$.SubmissionDate')) = DATEPART(WEEK,JSON_VALUE(NewItem,'$.ModifiedDate')) 
               THEN CASE WHEN DATEPART(dw,JSON_VALUE(NewItem,'$.ModifiedDate')) >= 4 AND DATEPART(dw,JSON_VALUE(NewItem,'$.ModifiedDate')) <=6  AND DATEPART(dw,JSON_VALUE(NewItem,'$.ModifiedDate')) = 4 THEN 'IN' ELSE 'OUT' END
               ELSE 'OUT' END 
               when [PT].[name] in ('Commissions') then 
               case when DATEPART(DAY,JSON_VALUE(NewItem,'$.SubmissionDate')) >= 10 AND JSON_VALUE(NewItem,'$.ModifiedDate') <=  DATEADD(MONTH,1,JSON_VALUE(NewItem,'$.ModifiedDate')) THEN  'IN'
                    when DATEPART(DAY,JSON_VALUE(NewItem,'$.SubmissionDate')) < 10 AND DATEPART(DAY,JSON_VALUE(NewItem,'$.ModifiedDate')) > 10 THEN  'OUT'
               END
               else 
               case when JSON_VALUE(NewItem,'$.Product') in ('Corporate','Group') or [PT].[name] in ('Pension') THEN 
               case when CONVERT(DATE,JSON_VALUE(NewItem,'$.ModifiedDate')) <= DATEADD(month, ((YEAR(JSON_VALUE(NewItem,'$.SubmissionDate')) - 1900) * 12) + MONTH(JSON_VALUE(NewItem,'$.SubmissionDate')), -1) then 'IN' 
               ELSE 'OUT' END 
               END
    end as [SLA]  
    FROM [audit].[AuditLog] [A]
	INNER JOIN [payment].[Payment] [P] ON [A].[ItemId] = [P].PaymentId
	LEFT JOIN [common].[PaymentStatus] [S] ON [S].Id = JSON_VALUE(NewItem,'$.PaymentStatus')
	LEFT JOIN [common].[PaymentType] [PT] ON [PT].Id = JSON_VALUE(NewItem,'$.PaymentType')
    LEFT JOIN [claim].[ClaimWorkflow] [Appr] ON [P].ClaimId = [Appr].[ClaimId] AND [Appr].[ClaimStatusId] = 13
	LEFT JOIN [claim].[ClaimWorkflow] [Auth] ON [P].ClaimId = [Auth].[ClaimId] AND [Auth].[ClaimStatusId] = 14
    WHERE [A].[ItemType] = 'payment_Payment' 
    AND [A].DATE between @StartDate and @EndDate
    AND [A].[Action] <> 'Update'
	AND [S].Name <> 'Reversed'
    AND JSON_VALUE(NewItem,'$.Reference') is not null and JSON_VALUE(NewItem,'$.Reference') <> ''
    ORDER BY [A].[ItemId] DESC
END
