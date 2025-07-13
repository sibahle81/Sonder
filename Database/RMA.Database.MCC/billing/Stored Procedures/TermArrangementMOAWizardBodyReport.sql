-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023/03/30
-- =============================================
create   PROCEDURE [billing].[TermArrangementMOAWizardBodyReport] --293127
    @wizardId int
	as 
	begin
     declare @json varchar(max) =(select data from bpm.Wizard where id =@wizardId)
	declare @results table (rolePlayerId int,totalAmount decimal(18,2),finPayeNumber varchar(50), companyname varchar(max));
	
	insert into @results(rolePlayerId,totalAmount, companyname,finPayeNumber)
	select * from  OPENJSON(
	(SELECT termArrangementSubsidiaries
	FROM OPENJSON(@json, '$') 
	WITH (    
		termArrangementSubsidiaries NVARCHAR(MAX) '$.termArrangementSubsidiaries' AS JSON
	) )
	,'$')
	WITH (
	roleplayerId int '$.roleplayerId', 
	balance VARCHAR(MAX) '$.balance',
		companyname VARCHAR(MAX) '$.debtorName',
		finpayeeNumber VARCHAR(MAX) '$.finpayeeNumber'
	)  
	
	 select ta.TotalAmount Balance, ta.FinPayeNumber,companyname   from @results ta
	
   end