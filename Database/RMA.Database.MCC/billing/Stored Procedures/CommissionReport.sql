



CREATE PROCEDURE [billing].[CommissionReport]
	@StartDate AS DATE,
	@EndDate AS DATE

AS
BEGIN
	Select clp.DisplayName AS Schemename,brokerage.[Name] AS BrokerName,bplt.PaymentDate,
	YEAR(bplt.PaymentDate)  as YearPaid,
	Datename(mm,(bplt.PaymentDate)) [MonthPaid],  
	SUBSTRING(bs.BankAccountNumber, 6, len(bs.BankAccountNumber)-5) [Account Number],bplt.PaymentAmount,
	p.policynumber,p.InstallmentPremium,clpp.DisplayName as DebtorName,iif(p.ParentPolicyId is null, 'Individual', 'Group') [FuneralType]
   ,p.CommissionPercentage * 100 AS CommissionPercentage,p.CommissionPercentage * bplt.PaymentAmount as CommissionPaid
 from [billing].[PremiumListingTransaction] bplt
	inner join [Load].[PremiumListingPaymentFile] lplpf on bplt.PaymentFileId = lplpf.Id
	inner join [billing].[Transactions] bt on lplpf.LinkedTransactionId =bt.TransactionId
	inner join [finance].[BankStatementEntry] bs on bt.BankStatementEntryId = bs.BankStatementEntryId
	inner join [policy].[Policy] p on p.PolicyId =bplt.Policyid
	inner join [policy].[Policy] pp on p.ParentPolicyId =pp.Policyid
	inner join [client].[RolePlayer] clp on  pp.PolicyOwnerId= clp.RolePlayerId
	inner join [broker].[Brokerage] brokerage on p.BrokerageId = brokerage.Id
	inner join [client].[RolePlayer] clpp on  p.PolicyOwnerId= clpp.RolePlayerId
 where bplt.PaymentDate between @StartDate and @EndDate
END