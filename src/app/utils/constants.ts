export const paginationOptions = {
  rows: 10,
  rowsPerPageOptions: [10, 15, 20],
};

export enum ToastSeverity {
  SUCCESS = 'success',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SECONDARY = 'secondary',
  CONTRAST = 'contrast',
}

export enum PublicationTables {
  PUBLICATIONS = 'publications',
  PUBLICATION_DETAILS = 'publication_details',
}

export enum ClientTables {
  CLIENTS = 'clients',
}

export const toastMessages = {
  SUCCESS: {
    TITLE: {
      SUCCESS: 'Success',
      SIGN_UP: 'Sign Up',
      LOGOUT: 'Logout Successful',
      LOGIN: 'Login Successful',
      NEW_PUBLICATION: 'New Publication Added',
      NEW_INVOICE: 'New Invoice Added',
      DELETE_PUBLICATION: 'Publication Deleted',
      DELETE_INVOICE: 'Invoice Deleted',
      DELETE_CLIENT: 'Client Deleted',
      ADD_CLIENT: 'New Client Added',
    },
    MESSAGE: {
      LOGOUT: 'You have successfully logged out.',
      LOGIN: 'You have successfully logged in.',
      VERIFY_EMAIL: 'Please go to the email to verify your account.',
      NEW_PUBLICATION: 'Publication added successfully.',
      NEW_INVOICE: 'Invoice added successfully.',
      DELETE_PUBLICATION: 'Publication deleted successfully.',
      DELETE_INVOICE: 'Selected Invoices have been deleted successfully.',
      DELETE_CLIENT: 'Client deleted successfully.',
      ADD_CLIENT: 'Client added successfully.',
    },
  },
  ERROR: {
    TITLE: {
      CONTACT_ADMIN: 'Please Contact Admin',
    },
    MESSAGE: {
      CONTACT_ADMIN: 'Something went wrong. Please contact admin.',
    },
  },
  INFO: {
    TITLE: {
      CANCELLED: 'Cancelled',
    },
    MESSAGE: {
      CANCELLED: 'Action cancelled.',
    },
  },
};
