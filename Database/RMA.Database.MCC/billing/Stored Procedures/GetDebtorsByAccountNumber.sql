-- =============================================
-- Author:		bongani makelane
-- Create date: 3 nov 2023
-- =============================================
CREATE PROCEDURE [billing].[GetDebtorsByAccountNumber]  --'62512854169','TR011519'
	@rmaBankAccount varchar(100),
	@searchText varchar(max)
AS
BEGIN
	
Select cf.rolePlayerId, cf.finPayeNumber,ba.accountnumber rmaBankAccountNumber, cc.[name] DisplayName  from policy.policy pp 
	join client.finpayee cf on cf.roleplayerid = pp.policypayeeid
	join product.productoption po on po.id = pp.productoptionid
	join common.industry ci on ci.id = cf.industryid
	join common.industryclass cin on cin.id = ci.industryclassid
	join product.productbankaccount cpba on cpba.IndustryClassId = cin.id and cpba.productid = po.productid
	join common.bankaccount ba on ba.id = cpba.bankaccountid
	left join  client.company cc on cf.roleplayerid = cc.roleplayerid
	where 
	ba.accountnumber = @rmaBankAccount and 	
	(cf.FinPayeNumber like '%' +@searchText + '%'	 or pp.policynumber like '%' +@searchText + '%')
END