using WebSupergoo.ABCpdf11;

namespace RMA.Service.Admin.MasterDataManager
{
    public static class AbcPdfConfiguration
    {
        public static void EnsureLicense()
        {
            if (!XSettings.LicenseValid)
            {
                if (!XSettings.InstallLicense(@"X/VKS0cMn5FgsCJaa62AaYnzLb9KQ4MYlq3wxL3
                                                FA0ojxkiVPH3rYMVWQ0lkwg8KCtU54j9EuSAXr6M
                                                jQbR4xFMnfGGcB3872DFMO / XgBjbi1y7S5MlUFrj
                                                UWBKMcmImUL1oUMFb8wtwCFVZoTCQbGhYcSuWVW7
                                                qmqUR6D9AYuLEkoAMnBCtyUPwlpJpyRd8TD80vFp
                                                480ezMDIRSfl7l1Ip72rxFJE5DPrTRn / oJdr6LQl
                                                PhLv + IklVuz27F7uEmp9jlzu7S02nlFcO
                                                "))
                {
                    //TODO Log License install error
                }
            }
        }
    }
}

