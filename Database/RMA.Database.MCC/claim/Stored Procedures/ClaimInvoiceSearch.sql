
CREATE PROCEDURE [claim].[ClaimInvoiceSearch] 
(
	@PageNumber			AS	INT,
	@RowsOfPage			AS	INT,
	@SortingCol			AS	VARCHAR(100) = 'ClaimId',
	@SortType			AS	VARCHAR(100) = 'Desc',
	@SearchCreatia		AS	VARCHAR(150) = '',
	@ClaimInvoiceType	AS	INT,
	@ClaimId			AS INT,
	@RecordCount		INT = 0 OUTPUT
)
AS
BEGIN

		--DECLARE	@PageNumber		AS INT			=	1;
		--DECLARE	@RowsOfPage		AS INT			=	5;
		--DECLARE	@SortingCol		AS VARCHAR(100) =	'ClaimId';
		--DECLARE	@SortType		AS VARCHAR(100) =	'Desc';
		--DECLARE	@SearchCreatia	AS VARCHAR(150) =	'WLSAward'; --'PartialDependencyLumpsum';
		--DECLARE @ClaimInvoiceType AS INT = 9;
		--DECLARE	@ClaimId	    AS INT = 33055;
		--DECLARE @RecordCount	INT			=	0 ;


	BEGIN --CREATING TEMP TABLE 
		CREATE TABLE #Pool  
			(
				ClaimInvoiceId			INT,
			    ClaimId					INT,
				ClaimInvoiceType		INT,
				ClaimBenefitId			INT,
				DateReceived			DATETIME,
				DateSubmitted			DATETIME,
				DateApproved			DATETIME,
				InvoiceAmount	        DECIMAL,
				InvoiceVat				DECIMAL,
				AuthorizedAmount		DECIMAL,
				AuthorisedVat			DECIMAL,
				InvoiceDate				DATETIME,
				ClaiminvoiceStatusId    int,
				IsAuthorised			INT,
				ExternalReferenceNumber	VARCHAR(255),
				InternalReferenceNumber	VARCHAR(255),
				IsDeleted				Bit,
				CreatedDate				DATETIME,
				CreatedBy				VARCHAR(255),
				Payee					VARCHAR(255)
			);
	END

	IF (@ClaimInvoiceType = 8)
		BEGIN
			INSERT INTO #Pool 
			select DISTINCT 
						c.ClaimInvoiceId		AS ClaimInvoiceId
						,c.claimId              AS ClaimId
						,c.claimInvoiceTypeId	AS ClaimInvoiceType
						,c.ClaimBenefitId		AS ClaimBenefitId
						,c.DateReceived		   	AS DateReceived
						,c.DateSubmitted		AS DateSubmitted
						,c.DateApproved		    AS DateApproved
						,c.InvoiceAmount		AS InvoiceAmount
						,c.InvoiceVat			AS AuthorizedAmount
						,c.AuthorisedAmount		AS AuthorizedAmount
						,c.AuthorisedVat		AS AuthorisedVat
						,c.InvoiceDate			AS InvoiceDate
						,c.ClaiminvoiceStatusId	AS ClaiminvoiceStatusId
						,c.IsAuthorised			AS IsAuthorised
						,c.ExternalReferenceNumber	AS ExternalReferenceNumber
						,c.InternalReferenceNumber	AS InternalReferenceNumber
						,c.IsDeleted				AS IsDeleted
						,c.CreatedDate				AS CreatedDate
						,c.CreatedBy				AS CreatedBy
						,RP.DisplayName					AS Payee
				from claim.ClaimInvoice				 AS c
				INNER JOIN [Claim].widowLumpSumInvoice WLS ON C.ClaimInvoiceId = WLS.ClaimInvoiceId
				LEFT JOIN [Client].[Roleplayer] RP ON RP.RolePlayerId = WLS.PayeeRoleplayerId
				where c.ClaimId = @ClaimId AND c.ClaimInvoiceTypeId = @ClaimInvoiceType
		END
	ELSE IF (@ClaimInvoiceType = 9)
		BEGIN
			INSERT INTO #Pool 
			select DISTINCT 
						c.ClaimInvoiceId		AS ClaimInvoiceId
						,c.claimId              AS ClaimId
						,c.claimInvoiceTypeId	AS ClaimInvoiceType
						,c.ClaimBenefitId		AS ClaimBenefitId
						,c.DateReceived		   	AS DateReceived
						,c.DateSubmitted		AS DateSubmitted
						,c.DateApproved		    AS DateApproved
						,c.InvoiceAmount		AS InvoiceAmount
						,c.InvoiceVat			AS AuthorizedAmount
						,c.AuthorisedAmount		AS AuthorizedAmount
						,c.AuthorisedVat		AS AuthorisedVat
						,c.InvoiceDate			AS InvoiceDate
						,c.ClaiminvoiceStatusId	AS ClaiminvoiceStatusId
						,c.IsAuthorised			AS IsAuthorised
						,c.ExternalReferenceNumber	AS ExternalReferenceNumber
						,c.InternalReferenceNumber	AS InternalReferenceNumber
						,c.IsDeleted				AS IsDeleted
						,c.CreatedDate				AS CreatedDate
						,c.CreatedBy				AS CreatedBy
						,RP.DisplayName				AS Payee
				from claim.ClaimInvoice				 AS c
				INNER JOIN [Claim].FuneralExpenseInvoice WLS ON C.ClaimInvoiceId = WLS.ClaimInvoiceId
				LEFT JOIN [Client].[Roleplayer] RP ON RP.RolePlayerId = WLS.PayeeRoleplayerId
				where c.ClaimId = @ClaimId AND c.ClaimInvoiceTypeId = @ClaimInvoiceType
		END
	ELSE IF (@ClaimInvoiceType = 1)
		BEGIN
			INSERT INTO #Pool 
			select DISTINCT 
						c.ClaimInvoiceId		AS ClaimInvoiceId
						,c.claimId              AS ClaimId
						,c.claimInvoiceTypeId	AS ClaimInvoiceType
						,c.ClaimBenefitId		AS ClaimBenefitId
						,c.DateReceived		   	AS DateReceived
						,c.DateSubmitted		AS DateSubmitted
						,c.DateApproved		    AS DateApproved
						,c.InvoiceAmount		AS InvoiceAmount
						,c.InvoiceVat			AS AuthorizedAmount
						,c.AuthorisedAmount		AS AuthorizedAmount
						,c.AuthorisedVat		AS AuthorisedVat
						,c.InvoiceDate			AS InvoiceDate
						,c.ClaiminvoiceStatusId	AS ClaiminvoiceStatusId
						,c.IsAuthorised			AS IsAuthorised
						,c.ExternalReferenceNumber	AS ExternalReferenceNumber
						,c.InternalReferenceNumber	AS InternalReferenceNumber
						,c.IsDeleted				AS IsDeleted
						,c.CreatedDate				AS CreatedDate
						,c.CreatedBy				AS CreatedBy
						,WLS.Payee				AS Payee
				from claim.ClaimInvoice				 AS c
				INNER JOIN [Claim].SundryInvoice WLS ON C.ClaimInvoiceId = WLS.ClaimInvoiceId
				--LEFT JOIN [Client].[Roleplayer] RP ON RP.RolePlayerId = WLS.PayeeRoleplayerId
				where c.ClaimId = @ClaimId AND c.ClaimInvoiceTypeId = @ClaimInvoiceType
		END
	ELSE
		BEGIN
			INSERT INTO #Pool 
			select DISTINCT 
						c.ClaimInvoiceId		AS ClaimInvoiceId
						,c.claimId              AS ClaimId
						,c.claimInvoiceTypeId	AS ClaimInvoiceType
						,c.ClaimBenefitId		AS ClaimBenefitId
						,c.DateReceived		   	AS DateReceived
						,c.DateSubmitted		AS DateSubmitted
						,c.DateApproved		    AS DateApproved
						,c.InvoiceAmount		AS InvoiceAmount
						,c.InvoiceVat			AS AuthorizedAmount
						,c.AuthorisedAmount		AS AuthorizedAmount
						,c.AuthorisedVat		AS AuthorisedVat
						,c.InvoiceDate			AS InvoiceDate
						,c.ClaiminvoiceStatusId	AS ClaiminvoiceStatusId
						,c.IsAuthorised			AS IsAuthorised
						,c.ExternalReferenceNumber	AS ExternalReferenceNumber
						,c.InternalReferenceNumber	AS InternalReferenceNumber
						,c.IsDeleted				AS IsDeleted
						,c.CreatedDate				AS CreatedDate
						,c.CreatedBy				AS CreatedBy
						,''							AS Payee
				from claim.ClaimInvoice				 AS c
				where c.ClaimId = @ClaimId AND c.ClaimInvoiceTypeId = @ClaimInvoiceType

		END --SELECT DATA

	--BEGIN -- CHECK CONDITIONS
	--	IF(@SearchCreatia IS NOT NULL AND @SearchCreatia != '')
	--	BEGIN
			
	--	END
	--END

	BEGIN --GET RECORD COUNT
		SELECT @RecordCount = Count(*) from #Pool
	END

	BEGIN --SORT BY CRITERIA
		IF(@SortingCol = 'ClaimId' and @SortType = 'asc' )
		BEGIN
			select * from #Pool 
			ORDER BY  CreatedDate asc
			OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY
		END
		ELSE IF(@SortingCol = 'ClaimId' and @SortType = 'DESC' )
		BEGIN
			select * from #Pool 
			ORDER BY  CreatedDate desc 
			OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY
		END
	END

	--select * from #Pool

	BEGIN -- CLEAN UP
		IF OBJECT_ID('tempdb..#Pool') IS NOT NULL DROP TABLE #Pool;
	END
END