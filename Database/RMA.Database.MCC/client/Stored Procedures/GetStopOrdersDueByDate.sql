CREATE PROCEDURE [client].[GetStopOrdersDueByDate] @date date
AS BEGIN 

	select c.StopOrderCompanyId,
		c.CompanyCode,
		c.CompanyName,
		c.Report,
		c.ReportFormat,
		c.Email,
		d.SalaryMonth,
		d.CutoffDate
	from client.StopOrderCompany c (nolock)
		inner join client.StopOrderDate d (nolock) on d.StopOrderCompanyId = c.StopOrderCompanyId
	where d.CutoffDate = @date
	  and c.IsDeleted = 0
	  and d.IsDeleted = 0
	order by c.CompanyCode

END
