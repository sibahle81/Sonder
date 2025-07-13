
-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2025-06-16
-- Description:	Get bulk allocation files 
-- =============================================
CREATE   PROCEDURE [billing].[GetBulkAllocationFiles] 
@productId int =null, 
@startDate date  =null,
@endDate date = null,
@pageNumber int=null, 
@pageSize int=null,
@orderBy  varchar(50)=null,
@sort  varchar(50)=null,
@productCategoryId int=null,
@industryClassId int=null    
AS 
BEGIN  

        declare  @uniquefiles table(
       [Id] [int])
	BEGIN TRY
	   if @industryClassId >0
		   begin
				insert into @uniquefiles 
				select distinct bulkallocationfileid from  [Load].[BulkManualAllocation]
				where bankaccountnumber in (
				select [AccountNumber] from  [product].[ProductBankAccount] pba
				join [common].[BankAccount]  cb on cb.id =pba.BankAccountId 
				where pba.IndustryClassId =@industryClassId )
		   end
	 
	     if @productId >0
			begin
				insert into @uniquefiles 
				select distinct bulkallocationfileid from  [Load].[BulkManualAllocation]
				where bankaccountnumber in (
				select [AccountNumber] from  [product].[ProductBankAccount] pba
				join [common].[BankAccount]  cb on cb.id =pba.BankAccountId 
				where pba.ProductId =@productId )
			end


	    if @startDate is not null and @endDate is not null
			begin	
				if (select count(1) from @uniquefiles) > 0
					begin
					insert into @uniquefiles 
					select [BulkAllocationFileId] from [Load].[BulkAllocationFile]
					where createddate between @startDate and  @endDate
					and [BulkAllocationFileId] in (select id from @uniquefiles)
				end
				else
					begin
					insert into @uniquefiles 
					select [BulkAllocationFileId] from [Load].[BulkAllocationFile]
					where createddate between @startDate and  @endDate
					end
			end 

			select * from [Load].[BulkAllocationFile]
			where [BulkAllocationFileId] in (select id from @uniquefiles)
		END TRY  
	BEGIN CATCH                           
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	END CATCH  
end