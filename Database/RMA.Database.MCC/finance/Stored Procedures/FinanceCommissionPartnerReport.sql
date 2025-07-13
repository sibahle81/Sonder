

--exec  [finance].[FinanceCommissionPartnerReport] @StartDate='2022-01-11',@EndDate='2022-08-22'
CREATE PROCEDURE [finance].[FinanceCommissionPartnerReport]
	@StartDate As Date,
	@EndDate AS Date

AS
BEGIN
			IF OBJECT_ID(N'#CommissionPartertemp', N'U') IS NOT NULL  
			DROP TABLE #CommissionPartertemp;

		    SELECT SUM(AllocatedAmount) as Premium_Billed,
			SUM(AllocatedAmount) - SUM(CommissionAmount) as Premium_Received,
			SUM(pay.Amount) AS Claims_Paid,
			SUM(CommissionAmount) as CommissionPaid,
			SUM(AdminServiceFeeAmount) as Fees,
			SUM(AllocatedAmount) as Partnership_Share_Amount,
			RecepientName as Partner_Name,
			RecepientId as Recepient_Id
			INTO #CommissionPartertemp
			FROM commission.Detail  cD 
			INNER JOIN payment.Payment pay on cD.PolicyNumber = pay.PolicyReference
			LEFT JOIN commission.Header cH ON cd.HeaderId = cH.HeaderId
			WHERE   (CAST(cD.CreatedDate as date)>=@StartDate AND CAST(cD.CreatedDate as date) <=@EndDate)
			AND (CAST(pay.CreatedDate as date)>=@StartDate AND CAST(pay.CreatedDate as date) <=@EndDate)
			GROUP BY ch.RecepientId, cH.RecepientName 


			SELECT Premium_Billed, Premium_Received, Claims_Paid, CommissionPaid, 
			(Fees + (Premium_Billed*bR.OnboardAdminFee)) as Fees_Paid,
			(Partnership_Share_Amount*bR.OnboardPercentageShare) as Partnership_Share, 
			Partner_Name
			FROM #CommissionPartertemp cPT
			INNER JOIN broker.Brokerage bR ON cPT.Recepient_Id = bR.Id
			 
END