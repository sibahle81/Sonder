 CREATE PROCEDURE [billing].[GetDebtorNotesAuditHeaderReport] 
	@roleplayerId int
AS
BEGIN
	  select cf.FinPayeNumber debtornumber, c.Name companyname, ic.Code classcode, ic.Name classname from client.FinPayee cf
  	inner join client.Company c on c.RolePlayerId	= cf.RolePlayerId
	inner join common.industry i on i.id = cf.industryid 
	inner join common.IndustryClass ic on i.industryclassid = ic.id
	where cf.RolePlayerId = @roleplayerId
END