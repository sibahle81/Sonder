using RMA.Service.Admin.MasterDataManager.Contracts.Enums;

namespace RMA.Service.ClientCare.Contracts.Entities.Product
{
    public class Template
    {
        public int TemplateId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public TemplateContextTypeEnum TemplateContextType { get; set; }
        public string TemplateHtml { get; set; }
        public string ReportTemplateUrl { get; set; }
    }
}