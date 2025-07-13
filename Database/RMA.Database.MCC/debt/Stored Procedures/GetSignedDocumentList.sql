CREATE   Procedure [debt].[GetSignedDocumentList]
(
@FinPayeeId int
)
AS
Begin
	select 
		[debt].[CollectionDocuments].Id,			
		[debt].[CollectionDocuments].FinPayeeId ,
		[debt].[CollectionDocuments].DocumentId ,		
		[debt].[CollectionDocuments].SignedDocumentURL ,				
		isnull([debt].[CollectionDocuments].DocumentName,'')DocumentName, 
		--'' [Type],
		isnull((select Name from documents.DocumentType  where  Id = (select docTypeId  from documents.Document where id= [debt].[CollectionDocuments].DocumentId)),'')  [Type], 
		[debt].[CollectionDocuments].SignedOn ,
		[debt].[CollectionDocuments].SignedBy ,
		[debt].[CollectionDocuments].IsActive  ,
		[debt].[CollectionDocuments].IsDeleted,		
		[debt].[CollectionDocuments].CreatedBy,	
		[debt].[CollectionDocuments].CreatedDate,	
		[debt].[CollectionDocuments].ModifiedBy,
		[debt].[CollectionDocuments].ModifiedDate 
	from 
	[debt].[CollectionDocuments] 
	where 
		[debt].[CollectionDocuments].IsDeleted = 0
		and [debt].[CollectionDocuments].FinPayeeId = @FinPayeeId
END
--exec [debt].[GetSignedDocumentList] 5280 -- Parameter @FinPayeeId  1 pass id of finpayee 