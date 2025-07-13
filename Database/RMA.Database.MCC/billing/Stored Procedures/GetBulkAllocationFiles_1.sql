
-- =============================================
-- Author:		Bongani Makelane
-- Create date: 2025-06-16
-- Description:	Get bulk allocation files 
-- =============================================
CREATE   PROCEDURE [billing].[GetBulkAllocationFiles] 
@startDate date  =null,
@endDate date = null,
@pageNumber int=null, 
@pageSize int=null,
@orderBy  varchar(50)=null,
@sort  varchar(50)=null,
@recordCount int = 0  Output
AS 
BEGIN  

        declare  @uniquefiles table(
       [Id] [int])
	BEGIN TRY
	   

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

			set @recordCount =(select count(1) from [Load].[BulkAllocationFile]
			where [BulkAllocationFileId] in (select id from @uniquefiles))
			select   isnull(records.totalRecords,0)  TotalLines, isnull(exceptions.totalErrors,0)  TotalExceptions, BulkAllocationFileId, FileIdentifier,[FileName], CreatedBy, CreatedDate,ModifiedBy,ModifiedDate,
			fileprocessingstatusid from [Load].[BulkAllocationFile] bf
			outer apply (select count(1) totalErrors from  [Load].[BulkManualAllocation] ba
			where [BulkAllocationFileId]  = bf.BulkAllocationFileId and ba.[Error] is not null) as exceptions
			outer apply (select count(1) totalRecords from  [Load].[BulkManualAllocation] ba1
			where [BulkAllocationFileId]  = bf.BulkAllocationFileId ) as records
			where [BulkAllocationFileId] in (select id from @uniquefiles)
			ORDER BY BulkAllocationFileId
OFFSET ((@pageNumber - 1) * @pageSize) ROWS
FETCH NEXT @pageSize ROWS ONLY;
		END TRY  
	BEGIN CATCH                           
		declare @message varchar(max) = isnull(ERROR_MESSAGE(), 'Unspecified Error')
		declare @severity int = ERROR_SEVERITY()
		declare @errorState int = ERROR_STATE()
		raiserror(@message, @severity, @errorState)
	END CATCH  
end