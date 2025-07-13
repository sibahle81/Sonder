
CREATE PROCEDURE [claim].[TTDsNearing18Months] 
AS
BEGIN

	DECLARE @ClaimInvoiceType AS INT = 3;
	Declare @DateCheck18Months As Date
	Declare @DateCheck As Date
	Declare @DateCheckAfter As Date
	SELECT @DateCheck18Months = DATEADD(month,-18,cast(GETDATE() as date))
	SELECT @DateCheckAfter = DATEADD(day, 7, @DateCheck18Months)
	SELECT @DateCheck = DATEADD(day, -7, @DateCheck18Months)

	print @DateCheck
	Print @DateCheck18Months
	Print @DateCheckAfter

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
				Payee					VARCHAR(255),
				PersonEventId			INT
			);
	END

	IF (@ClaimInvoiceType = 3)
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
						,D.PersonEventId			AS PersonEventId
				from claim.ClaimInvoice				 AS c
				INNER JOIN [Claim].DaysOffInvoice D ON C.ClaimInvoiceId = D.ClaimInvoiceId
				where (CAST(C.CreatedDate As Date) = @DateCheck OR CAST(C.CreatedDate As Date) = @DateCheckAfter) 
				AND  c.ClaimInvoiceTypeId = @ClaimInvoiceType
				AND C.ClaimInvoiceStatusId in (3,5,14)
				--3	Pending
				--5	Captured
				--14	ReInstated
		END
	
	select * from #Pool

	BEGIN -- CLEAN UP
		IF OBJECT_ID('tempdb..#Pool') IS NOT NULL DROP TABLE #Pool;
	END
END