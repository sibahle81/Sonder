CREATE   PROCEDURE [policy].[GeneratePremiumListingExceptionReport] (@fileIdentifier varchar(128))
AS
	BEGIN
		 --declare @fileIdentifier uniqueidentifier = '35F400EA-9A59-4706-8B49-494861F7032C';

		 SELECT DISTINCT POL.PolicyNumber,
				POL.IdNumber,
				POL.Name,
				POL.Surname,
				POL.ErrorCategory,
				POL.ErrorMessage,
				POL.ExcelRowNumber
		 FROM [policy].[PremiumListingErrorAudit] AS POL
		 WHERE POL.FileIdentifier like '%'+ @fileIdentifier + '%' --'D5730D8D-5579-44E2-8714-AE8AB002CA6E'
		 ORDER BY POL.ExcelRowNumber

	END
