
CREATE PROCEDURE [claim].[GetPagedClaimInvoicesByPersonEventId] 
(
	@PageNumber			AS	INT,
	@RowsOfPage			AS	INT,
	@SortingCol			AS	VARCHAR(100) = 'InvoiceDate',
	@SortType			AS	VARCHAR(100) = 'Desc',
	@SearchCreatia		AS	VARCHAR(150) = '',
	@PersonEventId       AS INT,
	@RecordCount		INT = 0 OUTPUT
)
AS
BEGIN
   
   DECLARE @ClaimId AS INT;
   SET @ClaimId = (SELECT ClaimId FROM claim.Claim WHERE PersonEventId = @PersonEventId)

   SELECT [ClaimInvoiceId]
      ,[ClaimId]
      ,[ClaimInvoiceTypeId]
      ,[ClaimBenefitId]
      ,[DateReceived]
      ,[DateSubmitted]
      ,[DateApproved]
      ,[InvoiceAmount]
      ,[InvoiceVat]
      ,[AuthorisedAmount]
      ,[AuthorisedVat]
      ,[InvoiceDate]
      ,[ClaimInvoiceStatusId]
      ,[IsBankingApproved]
      ,[IsAuthorised]
      ,[ClaimInvoiceDecisionId]
      ,[ExternalReferenceNumber]
      ,[InternalReferenceNumber]
      ,[IsDeleted]
      ,[CreatedBy]
      ,[CreatedDate]
      ,[ModifiedBy]
      ,[ModifiedDate]
  FROM [claim].[ClaimInvoice] WHERE [ClaimId] = @ClaimId

  SELECT @RecordCount = Count(*) FROM [claim].[ClaimInvoice] WHERE [ClaimId] = @ClaimId

END