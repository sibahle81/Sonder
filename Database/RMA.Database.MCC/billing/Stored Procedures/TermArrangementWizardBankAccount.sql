-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023/03/30
-- =============================================
create   PROCEDURE [billing].[TermArrangementWizardBankAccount] 
    @wizardId int
	as 
	begin        
		 declare @json varchar(max) =(select data from bpm.Wizard where id =@wizardId)
	declare @results table (rolePlayerId int);

insert into @results(rolePlayerId)
SELECT *
FROM OPENJSON(@json) WITH (
    rolePlayerId INT '$.rolePlayerId'	
    ) ;
select ba.AccountNumber from 
		policy.policy pp 
		
		join product.productoption po on pp.productoptionid = po.id
		join product.Product prd on po.ProductId = prd.Id
		join product.ProductBankAccount pba on pba.ProductId =prd.id
		join [common].[BankAccount] ba on ba.Id= pba.BankAccountId
		where  pp.PolicyPayeeId in (select rolePlayerId from @results)
		and pp.ParentPolicyId IS NULL	 
   end