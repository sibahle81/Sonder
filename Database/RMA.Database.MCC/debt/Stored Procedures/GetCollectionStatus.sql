
CREATE   Procedure [debt].[getCollectionStatus]
(
	@SearchText as varchar(250)
)
AS
Begin

select 
[debt].[CollectionStatusMaster].Id, 
[debt].[CollectionStatusMaster].StatusCategoryName,  
[debt].[CollectionStatusMaster].DebtCollectionStatusCodeId, 
[debt].[CollectionStatusMaster].DebtCollectionStatusCategoryId ,
[debt].[CollectionStatusMaster].LogText,
[debt].[CollectionStatusMaster].IsActive ,
isnull([debt].[CollectionStatusMaster].TransferToDepartmentId,0) TransferToDepartmentId     
from 
[debt].[CollectionStatusMaster]
inner join [common].DebtCollectionStatusCode on [common].DebtCollectionStatusCode.Id =[debt].[CollectionStatusMaster].DebtCollectionStatusCodeId 
inner join [common].DebtCollectionStatusCategory on [common].DebtCollectionStatusCategory.Id = [debt].[CollectionStatusMaster].DebtCollectionStatusCategoryId  
Where 	[debt].[CollectionStatusMaster].IsDeleted = 0 and  
		[debt].[CollectionStatusMaster].StatusCategoryName  like '%'+ @SearchText +'%'
		order by [debt].[CollectionStatusMaster].StatusCategoryName
END 

--exec [debt].[GetCollectionStatus] ''  --(here 'p' is Search Text Parameters)  @SearchText 