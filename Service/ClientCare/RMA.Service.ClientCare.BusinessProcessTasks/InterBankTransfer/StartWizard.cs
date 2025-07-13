using RMA.Service.Admin.BusinessProcessManager.Contracts.SDK;

using System;
using System.Collections;
using System.Threading.Tasks;

namespace RMA.Service.ClientCare.BusinessProcessTasks.InterBankTransfer
{
    public class StartWizard
    {
        public async Task<int> Process(IWizardContext context)
        {
            try
            {
                if (context != null)
                {
                    var wizardData = context.Deserialize<Model.InterBankTransfer>(context.Data);
                    return await AddWizard(context, wizardData);
                }

                return -1;
            }
            catch (Exception ex)
            {
                context?.LogError(ex);
            }

            return -1;
        }

        private async Task<int> AddWizard(IWizardContext context, Model.InterBankTransfer interBankTransfer)
        {
            var stepData = new ArrayList { interBankTransfer };
            return await context.CreateWizard($"Inter Bank Transfer {interBankTransfer.TransactionReference}", stepData);
        }
    }
}
