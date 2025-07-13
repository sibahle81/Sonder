-- =============================================
-- Author:		bongani makelane
-- Create date: 16 Feb 2022
-- Description:	Creates batches for invoices for different products and payment frequencies
-- =============================================
CREATE PROCEDURE [billing].[CreateInvoiceBatch] --'2'
	@productClassIds varchar(50)--- comma separated list of productclassIds
AS
BEGIN
	begin try
		begin tran trxInvoices

	declare @policies table (policyId int, policystatusId int, premium decimal(18,2))  

  insert into @policies
  select policyid,PolicyStatusId,InstallmentPremium from [policy].[Policy](nolock)  where ProductOptionId in 
    (select id from product.ProductOption where ProductId in 
(select id from product.product where ProductClassId in (select id from [common].[ProductClass] where id  in (SELECT Data FROM dbo.Split(@productClassIds, ',') ))))--2=life
    and ParentPolicyId is null and [PaymentFrequencyId] =2 --monthly

if(select month(getdate()) )in (3,6,9,12) --quaterly
	begin
	  insert into @policies
  select policyid,PolicyStatusId,InstallmentPremium from [policy].[Policy] (nolock) where ProductOptionId in 
    (select id from product.ProductOption where ProductId in 
(select id from product.product where ProductClassId in (select id from [common].[ProductClass] where id  in (SELECT Data FROM dbo.Split(@productClassIds, ',')))))--2=life
    and ParentPolicyId is null and [PaymentFrequencyId] =3
	end

if(select month(getdate())) in (6,12) --biannually
	begin
	  insert into @policies
  select policyid,PolicyStatusId,InstallmentPremium from [policy].[Policy] (nolock) where ProductOptionId in 
    (select id from product.ProductOption where ProductId in 
(select id from product.product where ProductClassId in (select id from [common].[ProductClass] where id  in (SELECT Data FROM dbo.Split(@productClassIds, ',')))))--2=life
    and ParentPolicyId is null and [PaymentFrequencyId] =4
	end

if(select month(getdate())) in (12) --annually
	begin
	  insert into @policies
  select policyid,PolicyStatusId,InstallmentPremium from [policy].[Policy] (nolock) where ProductOptionId in 
    (select id from product.ProductOption where ProductId in 
(select id from product.product where ProductClassId in (select id from [common].[ProductClass] where id  in (SELECT Data FROM dbo.Split(@productClassIds, ',')))))--2=life
    and ParentPolicyId is null and [PaymentFrequencyId] =1
	end

  insert into [billing].[BatchInvoice] values (Month(GETDATE()), YEAR(GETDATE()),1,0,'Sp_CreateInvoiceBatch',GETDATE(),'Sp_CreateInvoiceBatch',GETDATE(),1)
  declare @createdBatchId int = (select SCOPE_IDENTITY());

  insert into [billing].[BatchInvoiceDetail]([BatchInvoiceId],[PolicyId],[Premium],[PolicyStatusId]
,[IsDeleted],[CreatedBy],[CreatedDate],[ModifiedBy],[ModifiedDate],[IsExcludedDueToStatus])
  select @createdBatchId, policyId,premium,policystatusId,0,'Sp_CreateInvoiceBatch',GETDATE(),'Sp_CreateInvoiceBatch',GETDATE()
  , case when (EXISTS
(SELECT id FROM [policy].[PolicyStatusActionsMatrix] WHERE [PolicyStatus] = policystatusId and [DoRaiseInstallementPremiums] =1) ) then 0 else 1 end from 
  @policies
  	end try
	begin catch
	declare @Error varchar(max)
		rollback tran trxInvoices
		select @Error = concat( 'CreateInvoiceBatch - Error: ',ERROR_MESSAGE())
			insert into [dbo].[Logs] ([Message], MessageTemplate, [Level], [TimeStamp])
		select @Error, @Error, 'Fatal', getdate()		
	end catch
END