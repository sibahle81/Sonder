
 CREATE  PROCEDURE [billing].[InvoiceBankingDetails]
	@invoiceId int 
AS
BEGIN
SELECT  TOP (1) Bank.Name AS BankName, Branch.Name AS BranchName, Branch.Code AS BranchCode, BankAccount.AccountNumber AS AccNumber
FROM            billing.Invoice AS Invoice 
				INNER JOIN policy.Policy AS Policy ON Invoice.PolicyId = Policy.PolicyId 
				INNER JOIN client.FinPayee AS RolePlayer ON Policy.PolicyOwnerId = RolePlayer.RolePlayerId 
				INNER JOIN common.Industry AS Industry ON RolePlayer.IndustryId = Industry.Id 
				INNER JOIN common.IndustryClass AS Class ON Industry.IndustryClassId = Class.Id 
				INNER JOIN product.ProductOption AS ProductOption ON Policy.ProductOptionId = ProductOption.Id 
				INNER JOIN product.Product AS Product ON ProductOption.ProductId = Product.Id 
				INNER JOIN product.ProductBankAccount AS ProductBankAccount ON ProductBankAccount.IndustryClassId = Class.Id AND Product.Id =ProductBankAccount.ProductId
				INNER JOIN common.BankAccount AS BankAccount ON ProductBankAccount.BankAccountId = BankAccount.Id 
				INNER JOIN common.Bank AS Bank ON BankAccount.BankId = Bank.Id 
				INNER JOIN common.BankBranch AS Branch ON BankAccount.BranchId = Branch.Id
WHERE        (Invoice.InvoiceId = @invoiceId)
END