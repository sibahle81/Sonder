



-- =============================================
-- Author:		Sibahle Senda
-- Create date: 2021-03-09
-- Description:	Report Process [billing].[UnmetsReport] '2020-12-01', '2021-04-30'
-- =============================================

CREATE PROCEDURE [billing].[UnmetsReport]
	@StartDate AS DATE,
	@EndDate AS DATE,
	@IndustryId int

AS
BEGIN
 IF @IndustryId = 0
 BEGIN
   SELECT @IndustryId = NULL;
 END
SELECT DISTINCT ISNULL(DATEADD(day, 1, c.SubmissionDate), DATEADD(day, -1, bs2.TransactionDate)) [Action Date], bs.TransactionDate [Transaction Date],
p.PolicyNumber [Policy Number], rp.DisplayName [Debtor], ic.Name [Category],
(SELECT CONCAT(bs.StatementNumber, '/', bs.StatementLineNumber, ' ', (SELECT FORMAT (bs.StatementDate, 'dd/MM/yyyy')))) [Bank Reference], CONVERT(DECIMAL(18,2),( CONVERT(DECIMAL(18,2),bs.NettAmount)/100)) [Amount],
SUBSTRING(bs.BankAccountNumber, 6, len(bs.BankAccountNumber)-5) [Account Number], br.Name [Brokerage],
r.FirstName + ' ' + r.SurnameOrCompanyName [Representative], r.FirstName + ' ' + r.SurnameOrCompanyName [Juristic Representative],
/*CASE WHEN bs.UserReference LIKE '% 02 %' THEN '02'
WHEN bs.UserReference LIKE '% 02 %' THEN '02'
WHEN bs.UserReference LIKE '% 03 %' THEN '03'
WHEN bs.UserReference LIKE '% 04 %' THEN '04'
WHEN bs.UserReference LIKE '% 06 %' THEN '06'
WHEN bs.UserReference LIKE '% 12 %' THEN '12'
WHEN bs.UserReference LIKE '% 30 %' THEN '30'
WHEN bs.UserReference LIKE '% 32 %' THEN '32'
WHEN bs.UserReference LIKE '% 34 %' THEN '34'
WHEN bs.UserReference LIKE '% 36 %' THEN '36'
WHEN bs.UserReference IS NULL THEN ''
ELSE bs.UserReference END*/ (select top 1 ucd.[Description] from billing.UnpaidCodeDescriptions ucd where bs.UserReference like '% ' + ucd.Code + ' %') AS [Error Code]
FROM [finance].[BankStatementEntry] bs
LEFT OUTER JOIN [finance].[BankStatementEntry] bs2 ON bs2.[RequisitionNumber ] = bs.[RequisitionNumber ]
LEFT OUTER JOIN [billing].[Transactions] t1 ON t1.BankStatementEntryId = bs.BankStatementEntryId
LEFT OUTER JOIN [policy].[Policy] p ON p.PolicyPayeeId = t1.RolePlayerId
LEFT OUTER JOIN [billing].[Transactions] t2 ON t2.TransactionId = t1.LinkedTransactionId
LEFT OUTER JOIN [billing].[InvoiceAllocation] ia ON ia.TransactionId = t2.TransactionId
LEFT OUTER JOIN [billing].[Invoice] i ON i.InvoiceId = ia.InvoiceId
LEFT OUTER JOIN [billing].[Collections] c ON c.InvoiceId = i.InvoiceId
LEFT OUTER JOIN [client].[FinPayee] f ON f.RolePlayerId = t1.RolePlayerId
LEFT OUTER JOIN [client].[RolePlayer] rp ON rp.RolePlayerId = f.RolePlayerId
outer apply (select top 1 * from policy.PolicyBroker pb where pb.PolicyId = p.PolicyId
and pb.EffectiveDate < (select getdate()) order by pb.EffectiveDate desc) pb
LEFT OUTER JOIN  broker.Brokerage br on br.Id = pb.BrokerageId
LEFT OUTER JOIN  broker.Representative r on r.Id = pb.RepId
LEFT OUTER JOIN  broker.Representative jr on jr.Id = pb.JuristicRepId
LEFT OUTER JOIN  common.Industry ind on ind.Id = f.IndustryId
LEFT OUTER JOIN  common.IndustryClass ic on ic.Id = ind.IndustryClassId
WHERE bs.DocumentType = 'DO' AND bs.DebitCredit = '-'
AND  ISNULL(bs2.DocumentType, 'DO') = 'DO' AND  ISNULL(bs2.DebitCredit, '+') = '+'
AND ISNULL(bs2.NettAmount, bs.NettAmount) = bs.NettAmount
AND p.ParentPolicyId iS NULL
AND ISNULL(t1.TransactionTypeId, 1) = 1 -- payment reversal
AND ISNULL (t2.TransactionTypeId, 3) = 3 -- payment
AND bs.TransactionDate BETWEEN @StartDate and @EndDate
AND EXISTS (SELECT ind.[Id] FROM [common].[Industry] ind, [common].[IndustryClass] ic
    WHERE ic.[Id] = ISNULL(@IndustryId, ic.[Id]) AND ind.[IndustryClassId] = ic.[Id]
	AND ind.[Id] = ISNULL(f.IndustryId, ind.[Id]))
END
