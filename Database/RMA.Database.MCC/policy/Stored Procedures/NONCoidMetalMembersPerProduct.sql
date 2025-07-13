
CREATE PROCEDURE [policy].[NONCoidMetalMembersPerProduct]
AS
BEGIN

select PPR.Name as Product, Count(PP.PolicyID) As NumberOfPolicies,
SUM(PIL.NumberOfLives) As NumberOfLives,
SUM(Inv.TotalInvoiceAmount) As TotalInvoiceAmount,
SUM(InvPaid.TotalInvoiceAmount) As TotalInvoiceAmountPaid
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
--WHERE pp.PolicyId = 2730
Group by PPR.Name

END