import { IVendor, IVendorDetails } from "../interfaces/vendor-detail.interface";

export const paginationOptions = {
  rows: 10,
  rowsPerPageOptions: [10, 15, 20]
}

export enum ToastSeverity {
  SUCCESS = 'success',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SECONDARY = 'secondary',
  CONTRAST = 'contrast'
}

export const sampleVendors: IVendor[] = [
  {
    id: "TOINN001",
    name: "Times of India News Network",
    publicationName: "Times of India",
    contactPerson: "Rohan Sharma",
    email: "rohan.sharma@timesofindia.com"
  },
  {
    id: "HTCM002",
    name: "HT City Media",
    publicationName: "HT City",
    contactPerson: "Priya Jain",
    email: "priya.jain@htcity.com"
  },
  {
    id: "THBL003",
    name: "The Hindu Business Line",
    publicationName: "The Hindu Business Line",
    contactPerson: "Karthik Rao",
    email: "karthik.rao@thehindubusinessline.com"
  },
  {
    id: "ITG004",
    name: "India Today Group",
    publicationName: "India Today",
    contactPerson: "Rakesh Kumar",
    email: "rakesh.kumar@indiatodaygroup.com"
  },
  {
    id: "ET005",
    name: "The Economic Times",
    publicationName: "The Economic Times",
    contactPerson: "Suresh Menon",
    email: "suresh.menon@economictimes.com"
  },
  {
    id: "HT006",
    name: "Hindustan Times",
    publicationName: "Hindustan Times",
    contactPerson: "Anjali Singh",
    email: "anjali.singh@hindustantimes.com"
  },
  {
    id: "TIE007",
    name: "The Indian Express",
    publicationName: "The Indian Express",
    contactPerson: "Vivek Gupta",
    email: "vivek.gupta@indianexpress.com"
  },
  {
    id: "MDI008",
    name: "Mid-Day Infomedia",
    publicationName: "Mid-Day",
    contactPerson: "Rahul Desai",
    email: "rahul.desai@mid-day.com"
  },
  {
    id: "DNAM009",
    name: "DNA Media",
    publicationName: "DNA",
    contactPerson: "Nalini Singh",
    email: "nalini.singh@dnaindia.com"
  },
  {
    id: "DCH010",
    name: "Deccan Chronicle Holdings",
    publicationName: "Deccan Chronicle",
    contactPerson: "Srinivas Reddy",
    email: "srinivas.reddy@deccanchronicle.com"
  }
];

export const sampleVendorDetails: IVendorDetails[] = [
  {
    invoiceNo: "INV-001",
    date: new Date(),
    RONumber: "RO-001",
    RODate: new Date(),
    amount: 100123,
    description: "We offer a wide range of landscaping services, including garden design, installation, and maintenance.'"
  },
  {
    invoiceNo: "INV-002",
    date: new Date(),
    RONumber: "RO-002",
    RODate: new Date(),
    amount: 2000,
    description: "Our company specializes in providing eco-friendly cleaning services for homes and offices."
  },
  {
    invoiceNo: "INV-003",
    date: new Date(),
    RONumber: "RO-003",
    RODate: new Date(),
    amount: 3000,
    description: "We offer a wide range of delicious food products, including artisanal bread, pastries, and snacks."
  },
  {
    invoiceNo: "INV-004",
    date: new Date(),
    RONumber: "RO-004",
    RODate: new Date(),
    amount: 4000,
    description: "Our team provides creative design services, including logo design, branding, and website development."
  },
  {
    invoiceNo: "INV-005",
    date: new Date(),
    RONumber: "RO-005",
    RODate: new Date(),
    amount: 5000,
    description: "We specialize in providing smart home automation solutions for homes and offices."
  },
  {
    invoiceNo: "INV-006",
    date: new Date(),
    RONumber: "RO-006",
    RODate: new Date(),
    amount: 6000,
    description: "Our company offers personalized fitness programs and training services for individuals and groups."
  },
  {
    invoiceNo: "INV-007",
    date: new Date(),
    RONumber: "RO-007",
    RODate: new Date(),
    amount: 7000,
    description: "We provide innovative software solutions for businesses, including custom software development and integration."
  },
  {
    invoiceNo: "INV-008",
    date: new Date(),
    RONumber: "RO-008",
    RODate: new Date(),
    amount: 8000,
    description: "Our team specializes in providing delicious catering services for events and parties."
  },
  {
    invoiceNo: "INV-009",
    date: new Date(),
    RONumber: "RO-009",
    RODate: new Date(),
    amount: 9000,
    description: "We offer a wide range of landscaping services, including garden design, installation, and maintenance.'"
  },
  {
    invoiceNo: "INV-010",
    date: new Date(),
    RONumber: "RO-010",
    RODate: new Date(),
    amount: 10000,
    description: "Our company provides reliable IT solutions, including network security, data backup, and disaster recovery."
  },
  {
    invoiceNo: "INV-001",
    date: new Date(),
    RONumber: "RO-001",
    RODate: new Date(),
    amount: 100123,
    description: "We offer a wide range of landscaping services, including garden design, installation, and maintenance.'"
  },
  {
    invoiceNo: "INV-002",
    date: new Date(),
    RONumber: "RO-002",
    RODate: new Date(),
    amount: 2000,
    description: "Our company specializes in providing eco-friendly cleaning services for homes and offices."
  },
  {
    invoiceNo: "INV-003",
    date: new Date(),
    RONumber: "RO-003",
    RODate: new Date(),
    amount: 3000,
    description: "We offer a wide range of delicious food products, including artisanal bread, pastries, and snacks."
  },
  {
    invoiceNo: "INV-004",
    date: new Date(),
    RONumber: "RO-004",
    RODate: new Date(),
    amount: 4000,
    description: "Our team provides creative design services, including logo design, branding, and website development."
  },
  {
    invoiceNo: "INV-005",
    date: new Date(),
    RONumber: "RO-005",
    RODate: new Date(),
    amount: 5000,
    description: "We specialize in providing smart home automation solutions for homes and offices."
  },
  {
    invoiceNo: "INV-006",
    date: new Date(),
    RONumber: "RO-006",
    RODate: new Date(),
    amount: 6000,
    description: "Our company offers personalized fitness programs and training services for individuals and groups."
  },
  {
    invoiceNo: "INV-007",
    date: new Date(),
    RONumber: "RO-007",
    RODate: new Date(),
    amount: 7000,
    description: "We provide innovative software solutions for businesses, including custom software development and integration."
  },
  {
    invoiceNo: "INV-008",
    date: new Date(),
    RONumber: "RO-008",
    RODate: new Date(),
    amount: 8000,
    description: "Our team specializes in providing delicious catering services for events and parties."
  },
  {
    invoiceNo: "INV-009",
    date: new Date(),
    RONumber: "RO-009",
    RODate: new Date(),
    amount: 9000,
    description: "We offer a wide range of landscaping services, including garden design, installation, and maintenance.'"
  },
  {
    invoiceNo: "INV-010",
    date: new Date(),
    RONumber: "RO-010",
    RODate: new Date(),
    amount: 10000,
    description: "Our company provides reliable IT solutions, including network security, data backup, and disaster recovery."
  },
  {
    invoiceNo: "INV-001",
    date: new Date(),
    RONumber: "RO-001",
    RODate: new Date(),
    amount: 100123,
    description: "We offer a wide range of landscaping services, including garden design, installation, and maintenance.'"
  },
  {
    invoiceNo: "INV-002",
    date: new Date(),
    RONumber: "RO-002",
    RODate: new Date(),
    amount: 2000,
    description: "Our company specializes in providing eco-friendly cleaning services for homes and offices."
  },
  {
    invoiceNo: "INV-003",
    date: new Date(),
    RONumber: "RO-003",
    RODate: new Date(),
    amount: 3000,
    description: "We offer a wide range of delicious food products, including artisanal bread, pastries, and snacks."
  },
  {
    invoiceNo: "INV-004",
    date: new Date(),
    RONumber: "RO-004",
    RODate: new Date(),
    amount: 4000,
    description: "Our team provides creative design services, including logo design, branding, and website development."
  },
  {
    invoiceNo: "INV-005",
    date: new Date(),
    RONumber: "RO-005",
    RODate: new Date(),
    amount: 5000,
    description: "We specialize in providing smart home automation solutions for homes and offices."
  },
  {
    invoiceNo: "INV-006",
    date: new Date(),
    RONumber: "RO-006",
    RODate: new Date(),
    amount: 6000,
    description: "Our company offers personalized fitness programs and training services for individuals and groups."
  },
  {
    invoiceNo: "INV-007",
    date: new Date(),
    RONumber: "RO-007",
    RODate: new Date(),
    amount: 7000,
    description: "We provide innovative software solutions for businesses, including custom software development and integration."
  },
  {
    invoiceNo: "INV-008",
    date: new Date(),
    RONumber: "RO-008",
    RODate: new Date(),
    amount: 8000,
    description: "Our team specializes in providing delicious catering services for events and parties."
  },
  {
    invoiceNo: "INV-009",
    date: new Date(),
    RONumber: "RO-009",
    RODate: new Date(),
    amount: 9000,
    description: "We offer a wide range of landscaping services, including garden design, installation, and maintenance.'"
  },
  {
    invoiceNo: "INV-010",
    date: new Date(),
    RONumber: "RO-010",
    RODate: new Date(),
    amount: 10000,
    description: "Our company provides reliable IT solutions, including network security, data backup, and disaster recovery."
  }
]