using System;

namespace RMA.Service.ClientCare.Contracts.Attributes
{
    public class ImportFieldParameterAttribute : Attribute
    {
        public bool IsRequiredForStaging { get; set; } = false;
    }
}