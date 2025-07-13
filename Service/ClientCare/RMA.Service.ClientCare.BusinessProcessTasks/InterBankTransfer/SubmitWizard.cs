namespace RMA.Service.ClientCare.BusinessProcessTasks.InterBankTransfer
{
    public class SubmitWizard
    {
        //private readonly IBankStatementEntryService _bankStatementService;
        //public SubmitWizard(IBankStatementEntryService bankStatementService)
        //{
        //    _bankStatementService = bankStatementService;
        //}

        //public async Task Process(IWizardContext context)
        //{
        //    if (context != null)
        //    {
        //        var wizard = context.Deserialize<Wizard>(context.Data);
        //        var stepDate = context.Deserialize<ArrayList>(wizard.Data);

        //        var bankTransferWizard = context.Deserialize<Model.InterBankTransfer>(stepDate[0].ToString());
        //        var bankTransfer = new FinCare.Contracts.Entities.Billing.InterBankTransfer()
        //        {
        //            BankImportId = bankTransferWizard.BankImportId,
        //            ToBankAccount = bankTransferWizard.BankAccount,
        //            TransactionDate = bankTransferWizard.Date,
        //            TransferAmount = bankTransferWizard.TransferAmount

        //        };
        //        var results = await _bankStatementService.TransferAmounts(bankTransfer);
        //    }
        //}
    }
}
