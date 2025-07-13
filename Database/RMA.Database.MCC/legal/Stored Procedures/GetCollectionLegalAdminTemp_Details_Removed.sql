CREATE Procedure [legal].[GetCollectionLegalAdminTemp_Details_Removed] 
(
@ReffaralId as int,
@RecordCount INT = 0 OUTPUT
)
AS
Begin

DECLARE @SelectCount As NVARCHAR(MAX)

SET @SelectCount = (select 
		Count (*)
	from 
	 [legal].[CollectionLegalAdmin_Temp]
	where 
	IsDeleted = 0)

SET @RecordCount = (select 
		Count (*)
	from 
	 [legal].[CollectionLegalAdmin_Temp]
	where 
	IsDeleted = 0)

	select 
		[legal].[CollectionLegalAdmin_Temp].Id ,			
		[legal].[CollectionLegalAdmin_Temp].ReferralId,
		[legal].[CollectionLegalAdmin_Temp].Initial,
		[legal].[CollectionLegalAdmin_Temp].Name,
		[legal].[CollectionLegalAdmin_Temp].Surname,
		[legal].[CollectionLegalAdmin_Temp].IDNumber,
		[legal].[CollectionLegalAdmin_Temp].PrimaryEmailId, 	
		[legal].[ReferralDetails].CustomerName, 
		[legal].[ReferralDetails].PolicyNumber,
		[legal].[CollectionLegalAdmin_Temp].Language, 
		[legal].[CollectionLegalAdmin_Temp].Phone1,
		[legal].[CollectionLegalAdmin_Temp].Phone2,
		[legal].[CollectionLegalAdmin_Temp].Mobile,
		[legal].[CollectionLegalAdmin_Temp].Fax,
		[legal].[CollectionLegalAdmin_Temp].WorkTelephone,
		[legal].[CollectionLegalAdmin_Temp].DirectWorkTelephone,
		[legal].[CollectionLegalAdmin_Temp].Employer,		
		[legal].[CollectionLegalAdmin_Temp].EmployeeNumber,
		[legal].[CollectionLegalAdmin_Temp].IsActive,		
		[legal].[CollectionLegalAdmin_Temp].IsDeleted,		
		[legal].[CollectionLegalAdmin_Temp].CreatedBy,	
		[legal].[CollectionLegalAdmin_Temp].CreatedDate,		
		[legal].[CollectionLegalAdmin_Temp].ModifiedBy,
		[legal].[CollectionLegalAdmin_Temp].ModifiedDate,			
		@SelectCount 
	from 
	[legal].[CollectionLegalAdmin_Temp] inner join [legal].[ReferralDetails] on [legal].[CollectionLegalAdmin_Temp].ReferralId= [legal].[ReferralDetails].[ReferralId]	
	where 
		[legal].[CollectionLegalAdmin_Temp].IsDeleted = 0
		and [legal].[CollectionLegalAdmin_Temp].ReferralId= @ReffaralId
END
--exec [legal].[GetCollectionLegalAdminTemp_Details_Removed] 1