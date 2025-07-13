
CREATE PROCEDURE [policy].[NONCoidMetalMembersPerMonth]
AS
BEGIN

select CONCAT(DATENAME(MONTH,PP.CreatedDate) , ' ', YEAR(PP.CreatedDate)) as Product, Count(PP.PolicyID) As NumberOfPolicies,
ISNULL(SUM(PIL.NumberOfLives), 0) As NumberOfLives,
ISNULL(SUM(Inv.TotalInvoiceAmount),0) As TotalInvoiceAmount,
ISNULL(SUM(InvPaid.TotalInvoiceAmount),0) As TotalInvoiceAmountPaid,
ISNULL(SUM(InvPartial.TotalInvoiceAmountPartial),0) As TotalInvoiceAmountPartiallyPaid,
ISNULL(SUM(Inv.TotalInvoiceAmount) - SUM(InvPartial.TotalInvoiceAmountPartial),0) As InvoicePaid
from [AZD-MCC].[policy].[policy] PP
INNER JOIN [Product].[ProductOption] PPO ON PP.ProductOptionId = PPO.Id
INNER JOIN [Product].[Product] PPR ON PPO.ProductId = PPR.ID
INNER JOIN (SELECT [Policy].PolicyId,
			COUNT([InsuredLives].RolePlayerId) AS NumberOfLives
			FROM policy.Policy [Policy]
			INNER JOIN policy.PolicyInsuredLives [InsuredLives] ON [Policy].PolicyId = [InsuredLives].PolicyId
			group by [Policy].PolicyId) as PIL on PIL.PolicyId = PP.PolicyId
LEFT JOIN (SELECT [Policy].PolicyId,
			SUM(BIN.TotalInvoiceAmount) AS TotalInvoiceAmount
			FROM policy.Policy [Policy]
			INNER JOIN [billing].[Invoice] BIN ON [Policy].PolicyId = BIN.PolicyId
			group by [Policy].PolicyId) as Inv on Inv.PolicyId = PP.PolicyId
LEFT JOIN (SELECT [Policy].PolicyId,
			SUM(BINPaid.TotalInvoiceAmount) AS TotalInvoiceAmount
			FROM policy.Policy [Policy]
			INNER JOIN [billing].[Invoice] BINPaid ON [Policy].PolicyId = BINPaid.PolicyId
			Where BINPaid.InvoiceStatusId = 1
			group by [Policy].PolicyId) as InvPaid on InvPaid.PolicyId = PP.PolicyId
LEFT JOIN (SELECT [Policy].PolicyId,
			SUM(BINAllocation.Amount) AS TotalInvoiceAmountPartial
			FROM policy.Policy [Policy]
			INNER JOIN [billing].[Invoice] BINPaid ON [Policy].PolicyId = BINPaid.PolicyId
			INNER JOIN [billing].[InvoiceAllocation] BINAllocation ON BINPaid.InvoiceId = BINAllocation.InvoiceId
			Where BINPaid.InvoiceStatusId = 4
			group by [Policy].PolicyId) as InvPartial on InvPartial.PolicyId = PP.PolicyId
--WHERE pp.PolicyId = 2730
Group by CONCAT(DATENAME(MONTH,PP.CreatedDate), ' ',YEAR(PP.CreatedDate)) , YEAR(PP.CreatedDate), MONTH(PP.CreatedDate)
Order by YEAR(PP.CreatedDate), MONTH(PP.CreatedDate)

END