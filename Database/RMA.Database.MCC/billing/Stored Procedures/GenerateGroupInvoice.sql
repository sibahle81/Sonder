-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2022-05-30
-- Description:	create group invoice using currently active child policies
-- =============================================
CREATE PROCEDURE [billing].[GenerateGroupInvoice]
	@policyId int,
	@invoiceDate datetime, 
	@collectionDate datetime
AS
BEGIN	

		declare @childPolicies table (id int identity(1,1),policyId int, installmentAmount decimal(18,2))

		insert into @childPolicies 
		select p.[PolicyId] , [InstallmentPremium]
				from [policy].[Policy] p with (nolock)
					inner join [policy].[PolicyStatusActionsMatrix] am with (nolock) on am.PolicyStatus = p.PolicyStatusId
				where p.[ParentPolicyId] = @policyId
				  and am.[DoRaiseInstallementPremiums] = 1

		declare @invoiceTotal decimal(18,2) =		  (select sum( [InstallmentPremium])
				from [policy].[Policy] p with (nolock)
					inner join [policy].[PolicyStatusActionsMatrix] am with (nolock) on am.PolicyStatus = p.PolicyStatusId
				where p.[ParentPolicyId] = @policyId
				  and am.[DoRaiseInstallementPremiums] = 1)
		declare @roleplayerId int =(select PolicyPayeeId from [policy].[policy] where PolicyPayeeId= PolicyOwnerId  and ParentPolicyId is null and PolicyId =@policyId )
		declare @policyNumber int =(select PolicyNumber from [policy].[policy] where PolicyPayeeId= PolicyOwnerId  and ParentPolicyId is null and PolicyId =@policyId )
		
	   INSERT INTO [billing].[Invoice] ([PolicyId]
		  ,[CollectionDate]
		  ,[TotalInvoiceAmount]
		  ,[InvoiceStatusId]
		  ,[InvoiceDate]
		  ,[IsDeleted]
		  ,[CreatedBy]
		  ,[CreatedDate],InvoiceNumber ,[ModifiedBy]
		  ,[ModifiedDate])
		  VALUES (@policyId,@collectionDate,@invoiceTotal,3,@invoiceDate,'0','system@randmutual.co.za',getdate(),'','system@randmutual.co.za',getdate())
		 
		  declare @invoiceid int=(select Scope_Identity())
		  declare @current int =(select top 1 id from @childPolicies)
		  while (select count(id) from @childPolicies) >1
			begin
			declare @childAmount decimal(18,2)
			declare @childPolicyId int

			select @childAmount = installmentAmount, @childPolicyId =policyId,@current = id  from @childPolicies where id = @current
			 insert into billing.InvoiceLineItems (InvoiceId, Amount,policyid, CreatedBy, ModifiedBy, CreatedDate, ModifiedDate) values(@invoiceid,@childAmount,@childPolicyId,'system@randmutual.co.za',getdate(),'system@randmutual.co.za',getdate())
			
			delete from @childPolicies where  id = @current
			set	@current  =(select top 1 id from @childPolicies)		
			end
		  
		  insert into [billing].[Transactions] ([InvoiceId]
		  ,[RolePlayerId]
		  ,[TransactionTypeLinkId]
		  ,[Amount]
		  ,[TransactionDate]
		  ,[BankReference]
		  ,[TransactionTypeId]
		  ,[CreatedDate]
		  ,[ModifiedDate]
		  ,[CreatedBy]
		  ,[ModifiedBy])
		  values (@invoiceid,@roleplayerId,'1',@invoiceTotal,getdate(),@policyNumber,	'6',	getdate(),	getdate(),	'system@randmutual.co.za',	'system@randmutual.co.za')
END