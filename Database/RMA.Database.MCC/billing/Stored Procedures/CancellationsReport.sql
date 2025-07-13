CREATE   PROCEDURE [billing].[CancellationsReport]
    @StartDate AS DATE,
       @EndDate AS DATE
AS

BEGIN  

DECLARE @SearchTable TABLE (
              AccountNumber VARCHAR(250),
              DebtorName VARCHAR(250),
              PolicyNumber VARCHAR(250),
              PolicyInceptionDate Date,
              ExpiryDate Date,
              PolicyStatus VARCHAR(250),
              PolicyStatusDate Date,
              PremiumAmount Decimal(18,2), -- HOW MUCH TO PAY BACK select * from 
              OutstandingBalance Decimal(18,2), -- ACCOUNT BALANCE
              StatusChangedBy VARCHAR(250),
              ProductCode VARCHAR(250),
              CancellationReason VARCHAR(250),
              CancellationDate Date,
              IndustryClass VARCHAR(250),
              PolicyInceptionYear INT,
              CancellationIndicator VARCHAR(250),
              Notes VARCHAR(max),
              CancellationNotificationDate Date,
              WizardConfigurationId INT
       );

       INSERT INTO @SearchTable
       SELECT DISTINCT
          F.FinPayeNumber
         ,R.DisplayName
         ,P.PolicyNumber
         ,P.PolicyInceptionDate
         ,P.ExpiryDate
         ,S.Name
         ,P.ModifiedDate
         ,(SELECT TOP 1 Amount FROM billing.Transactions WHERE RolePlayerId in (SELECT RolePlayerId from client.Finpayee WHERE finpayenumber = F.FinPayeNumber) AND TransactionTypeId = 4 ORDER BY 1 DESC)
         , (SELECT (SELECT SUM(Amount) FROM billing.Transactions WHERE RolePlayerId in (SELECT RolePlayerId FROM client.Finpayee WHERE finpayenumber = F.FinPayeNumber) AND TransactionTypeLinkid = 2) - (SELECT SUM(Amount) from billing.Transactions where RolePlayerId in (SELECT RolePlayerId FROM client.Finpayee WHERE finpayenumber = F.FinPayeNumber) AND TransactionTypeLinkId = 1))
         ,P.ModifiedBy
         ,PR.Code As ProductCode
         ,CR.Name As CancellationReason
         ,P.CancellationDate
         ,IC.Name As IndustryClass
         ,YEAR(P.PolicyInceptionDate)
         ,S.Name
         ,PN.[Text]
         ,W.CreatedDate As CancellationNotificationDate
         ,W.WizardConfigurationId AS WizardConfigurationId
  FROM [policy].[Policy] P 
  INNER JOIN [client].[FinPayee] F ON P.PolicyOwnerId = F.RolePlayerId
  INNER JOIN [client].[RolePlayer] R ON R.RolePlayerId = F.RolePlayerId
  INNER JOIN [common].[PolicyStatus] S ON P.PolicyStatusId = S.Id
  INNER JOIN [product].[ProductOption] PO ON P.ProductOptionId = PO.Id
  INNER JOIN [product].[Product] PR ON PO.ProductId = PR.Id
  INNER JOIN common.PolicyCancelReason CR ON P.PolicyCancelReasonId = CR.Id
  INNER JOIN [policy].[PolicyNote] PN ON P.PolicyId = PN.PolicyId
  INNER JOIN [bpm].[Wizard] W ON W.LinkedItemId = P.PolicyId
  LEFT JOIN [common].[Industry] IND ON F.IndustryId = IND.Id
  LEFT JOIN [common].[IndustryClass] IC ON IND.IndustryClassId = IC.Id
  WHERE P.PolicyStatusId = 2 OR P.PolicyStatusId = 4

  SELECT DISTINCT
           AccountNumber,
              DebtorName,
              PolicyNumber,
              PolicyInceptionDate,
              ExpiryDate,
              PolicyStatus,
              PolicyStatusDate,
              PremiumAmount,
              OutstandingBalance,
              StatusChangedBy,
              ProductCode,
              CancellationReason,
              CancellationDate,
              IndustryClass,
              PolicyInceptionYear,
              CancellationIndicator,
              Notes,
              CancellationNotificationDate,
              WizardConfigurationId
       FROM @SearchTable
       WHERE (CancellationDate BETWEEN @StartDate AND @EndDate)
       AND (WizardConfigurationId = 26 OR WizardConfigurationId = 53)
END
