
CREATE   Procedure [debt].[GetPendingBillToAssignAgent]
(
	@IsExecute bit = 0
)
AS
BEGIN

	CREATE TABLE #AdjustPendingInvoice(
    FinPayeeId int  NOT NULL,
    Id int NOT NULL,
    CustomerNumber varchar(50) NOT NULL,
    CustomerName varchar(250) NOT NULL,
    OpeningBalance numeric(18,2) NOT NULL,
    CurrentBalance numeric(18,2) NOT NULL,
    EmailAddress varchar(150) NOT NULL,
    ClientType varchar(50) NOT NULL,
    Book varchar(50) NULL)
 
insert into #AdjudicateClaims
select
 distinct [client].[Roleplayer].RolePlayerId FinpayeeId,
 [client].[Roleplayer].RolePlayerId Id,
 [Client].[FinPayee].FinPayeNumber [CustomerNumber],
 [client].[Roleplayer].DisplayName [CustomerName], 
CAST(100.51 AS decimal(18,2)) OpeningBalance,
CAST(100.51 AS decimal(18,2)) CurrentBalance,
 [client].[Roleplayer].EmailAddress , 
 CASE WHEN [Roleplayer].RolePlayerIdentificationTypeId = 2 THEN 'Company'
			ELSE 'Individual' END AS ClientType, 
			[common].[IndustryClass].Name [Book]
from [client].FinPayee 
inner join [client].RolePlayer on [client].RolePlayer.RolePlayerId =[client].FinPayee.RolePlayerId 
inner join [policy].Policy  on [policy].Policy.PolicyOwnerId = [client].FinPayee.RolePlayerId 
inner join [billing].[Invoice] on [billing].[Invoice].PolicyId = [policy].Policy.PolicyId 
LEFT JOIN [Client].[Company] [Company] ON [Company].RolePlayerId = [client].[Roleplayer].RolePlayerId
left join [common].[IndustryClass] on [common].[IndustryClass].Id  =  [Company].IndustryClassId 
where [billing].[Invoice].InvoiceStatusId =2  

Select * from #AdjustPendingInvoice Order by ClaimId desc

END 
--exec [debt].[GetPendingBillToAssignAgent] 