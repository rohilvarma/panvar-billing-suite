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

export const toastMessages = {
  SUCCESS: {
    TITLE: {
      SUCCESS: 'Success',
      SIGN_UP: 'Sign Up',
      LOGOUT: 'Logout Successful',
      LOGIN: 'Login Successful',
      NEW_VENDOR: 'New Vendor Added',
      NEW_INVOICE: 'New Invoice Added',
      DELETE_VENDOR: 'Vendor Deleted',
      DELETE_INVOICE: 'Invoice Deleted',
    },
    MESSAGE: {
      LOGOUT: 'You have successfully logged out.',
      LOGIN: 'You have successfully logged in.',
      VERIFY_EMAIL: 'Please go to the email to verify your account.',
      NEW_VENDOR: 'Vendor added successfully.',
      NEW_INVOICE: 'Invoice added successfully.',
      DELETE_VENDOR: 'Vendor deleted successfully.',
      DELETE_INVOICE: 'Selected Invoices have been deleted successfully.',
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
