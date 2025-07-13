-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2023/03/30
-- =============================================
CREATE   PROCEDURE [billing].[TermArrangementBankAccount] 
    @bankaccountId int =NULL
	as 
	begin  
	if @bankaccountId is not null
	begin
		select ba.AccountNumber from [common].[BankAccount] ba where ba.Id=@bankaccountId
		end
		else
		begin
		select ba.AccountNumber from [common].[BankAccount] ba where ba.Id=1
		end
   end