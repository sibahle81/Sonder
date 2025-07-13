CREATE   Procedure [debt].GetDebtCareStatusUpdateDetails                                                                                             
(                                                                                                                                                    
	@Id int
)                                                                                                                                                    
As 
Begin 
select 
 debt.TransactionCollectionStatus.Id,  
 debt.CollectionStatusMaster.StatusCategoryName, 
 debt.TransactionCollectionStatus.CollectionStatusCodeId DebtCollectionStatusCodeId, 
 common.DebtCollectionStatusCode.Name [DebtCollectionStatusCodeName], 
 debt.CollectionStatusMaster.DebtCollectionStatusCategoryId, 
 common.DebtCollectionStatusCategory.Name [DebtCollectionStatusCategoryName] , 
 debt.CollectionStatusMaster.LogText, 
 debt.TransactionCollectionStatus.FinPayeeId , 
 debt.TransactionCollectionStatus.CollectionStatusCodeId , 
 debt.TransactionCollectionStatus.CollectionStatusName,
 debt.TransactionCollectionStatus.NextActionDate, 
 debt.TransactionCollectionStatus.TransferToDepartmentId, 
 debt.TransactionCollectionStatus.TransfertToUserId,
 debt.TransactionCollectionStatus.PtpCount,
 debt.TransactionCollectionStatus.Note, 
 debt.TransactionCollectionStatus.IsActive, 
 debt.TransactionCollectionStatus.IsDeleted, 
 debt.TransactionCollectionStatus.CreatedBy,
 debt.TransactionCollectionStatus.CreatedDate, 
 debt.TransactionCollectionStatus.ModifiedBy, 
 debt.TransactionCollectionStatus.ModifiedDate 
from debt.TransactionCollectionStatus 
left join common.DebtCollectionStatusCode on common.DebtCollectionStatusCode.Id =debt.TransactionCollectionStatus.CollectionStatusCodeId
left join debt.CollectionStatusMaster on debt.CollectionStatusMaster.DebtCollectionStatusCodeId = debt.TransactionCollectionStatus.CollectionStatusCodeId   
 
left join common.DebtCollectionStatusCategory on common.DebtCollectionStatusCategory.Id = debt.CollectionStatusMaster.DebtCollectionStatusCategoryId  
--where debt.TransactionCollectionStatus.Id =@Id 
where debt.TransactionCollectionStatus.FinPayeeId=@Id and debt.TransactionCollectionStatus.IsDeleted = 0 
END 

--exec [debt].GetDebtCareStatusUpdateDetails 1 -- Parameter @Id=1     (debt.TransactionCollectionStatus.FinPayeeId)