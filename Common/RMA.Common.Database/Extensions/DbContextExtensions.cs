using RMA.Common.Entities;
using RMA.Common.Exceptions;

using System.Collections.Generic;
using System.Data.Entity.Validation;

namespace RMA.Common.Database.Extensions
{
    public static class DbContextExtensions
    {
        public static BusinessException HandleDbValidationErrors(IEnumerable<DbEntityValidationResult> errors)
        {
            if (errors == null) return null;
            var errorCodes = new List<string>();
            foreach (var dbEntityValidationResult in errors)
            {
                foreach (var dbValidationError in dbEntityValidationResult.ValidationErrors)
                    errorCodes.Add(dbValidationError.ErrorMessage);
            }

            if (errorCodes.Count > 0) return new BusinessException(errorCodes);
            return null;
        }
    }
}