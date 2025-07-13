
CREATE PROCEDURE [claim].[GetPagedClaimInvoices] 
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
 --   BEGIN --DEBUGGING
	--	DECLARE	@PageNumber		AS INT			=	1;
	--	DECLARE	@RowsOfPage		AS INT			=	5;
	--	DECLARE	@SortingCol		AS VARCHAR(100) =	'InvoiceDate';
	--	DECLARE	@SortType		AS VARCHAR(100) =	'Desc';
	--	DECLARE	@SearchCreatia	AS VARCHAR(150) =	'';
	--	DECLARE	@PersonEventId	    AS INT = 20000158;
	--	DECLARE @RecordCount	INT			=	0 ;
	--END

	BEGIN --CREATING TEMP TABLE 
		CREATE TABLE #Pool  
			(
			    ClaimId					INT,
				ClaimInvoiceType		INT,
				BenefitName				VARCHAR(100),
				BenefitCode			    VARCHAR(50),
				EstimatedValue			DECIMAL,
				CoverMemberType	        INT,
				InvoiceAmount	        DECIMAL,
				AuthorizedAmount		DECIMAL,
				InvoiceDate				DATETIME,
				ClaimInvoiceStatus      int,
				Included                BIT,
			);
	END
	
	BEGIN
		INSERT INTO #Pool 
		select DISTINCT  
				  c.claimId                         AS ClaimId
				, ci.claimInvoiceTypeId				AS ClaimInvoiceType
				, pb.[name]							AS BenefitName
				, pb.Code			 			   	AS BenefitCode
				, cb.EstimatedValue                 AS EstimatedValue
				, ct.id							    AS CoverMemberType
				, ci.InvoiceAmount                  AS InvoiceAmount
				, ci.AuthorisedAmount               AS AuthorizedAmount
				, ci.InvoiceDate                    AS InvoiceDate
				, cis.claiminvoiceStatusId			AS ClaimInvoiceStatus
				, 1									AS Included

			from claim.Claim				 AS c   
			JOIN claim.personEvent           AS p   ON p.personEventId = c.personEventId
			JOIN claim.ClaimBenefit          AS cb  ON cb.ClaimId = c.ClaimId
			JOIN Product.Benefit             AS Pb  ON Pb.id = cb.benefitId
			JOIN common.BenefitType          AS bt  ON bt.Id = Pb.BenefitTypeId
			JOIN claim.ClaimInvoice          AS ci  ON c.claimId = ci.claimId
			JOIN claim.ClaimInvoiceStatus    AS cis ON cis.claiminvoiceStatusId = ci.claiminvoiceStatusId
			JOIN common.CoverMemberType      AS ct  ON ct.id = pb.covermemberTypeid

			where p.personEventId = @PersonEventId

	END --SELECT DATA

	BEGIN -- CHECK CONDITIONS
		IF(@SearchCreatia IS NOT NULL AND @SearchCreatia != '')
		BEGIN
			update #Pool set included = 0;
			update #Pool set included = 1
			where    BenefitName            LIKE '%' + @SearchCreatia + '%'
				OR	(BenefitCode			LIKE '%' + @SearchCreatia + '%')
		END
	END

	BEGIN --GET RECORD COUNT
	DELETE FROM #Pool WHERE included = 0;
		SELECT @RecordCount = Count(*) from #Pool
	END

	BEGIN --SORT BY CRITERIA
		IF(@SortingCol = 'InvoiceDate' and @SortType = 'asc' )
		BEGIN
			select * from #Pool 
			ORDER BY  InvoiceDate asc
			OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY
		END
		ELSE IF(@SortingCol = 'InvoiceDate' and @SortType = 'DESC' )
		BEGIN
			select * from #Pool 
			ORDER BY  InvoiceDate desc 
			OFFSET (@PageNumber-1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY
		END
	END

	BEGIN -- CLEAN UP
		IF OBJECT_ID('tempdb..#Pool') IS NOT NULL DROP TABLE #Pool;
	END
END