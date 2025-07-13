

import { UploadFile } from 'projects/shared-components-lib/src/lib/upload-control/upload-file.class';
import { User } from 'projects/shared-models-lib/src/lib/security/user';
import { Client } from 'projects/clientcare/src/app/client-manager/shared/Entities/client';
import { Contact } from 'projects/clientcare/src/app/client-manager/shared/Entities/contact';

export class RegistrationData {
    client: Client;
    contact: Contact;
    user: User;
    uploadFileList: UploadFile[];
}
