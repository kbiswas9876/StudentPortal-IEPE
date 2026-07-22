export interface ExamCategory {
  category: string
  exams: string[]
}

export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    category: 'West Bengal State Exams',
    exams: [
      'WBCS (Executive & Allied Services)',
      'WB Police SI (Sub-Inspector)',
      'WB Police Constable / Lady Constable',
      'WBPSC Clerkship Examination',
      'WBPSC Miscellaneous Services',
      'WB Primary TET / Upper Primary TET',
      'WB Audit & Accounts Service',
      'WBSIDCL / WB Municipal Service',
      'WB Health / Staff Nurse Service',
    ],
  },
  {
    category: 'Central SSC Exams',
    exams: [
      'SSC CGL (Combined Graduate Level)',
      'SSC CHSL (10+2 Higher Secondary)',
      'SSC MTS (Multi-Tasking Staff)',
      'SSC CPO (Sub-Inspector in Delhi Police / CAPF)',
      'SSC GD Constable',
      'SSC Stenographer Grade C & D',
    ],
  },
  {
    category: 'Banking & Insurance',
    exams: [
      'IBPS PO (Probationary Officer)',
      'IBPS Clerk',
      'SBI PO (State Bank of India)',
      'SBI Clerk (Junior Associate)',
      'RBI Grade B Officer',
      'RBI Assistant',
      'LIC AAO / ADO / Assistant',
    ],
  },
  {
    category: 'Railways (RRB)',
    exams: [
      'RRB NTPC (Non-Technical Popular Categories)',
      'RRB ALP (Assistant Loco Pilot)',
      'RRB Group D (Level-1 Posts)',
      'RRB JE (Junior Engineer)',
    ],
  },
  {
    category: 'UPSC & Defense',
    exams: [
      'UPSC CSE (Civil Services Examination)',
      'UPSC EPFO (Enforcement Officer / APFC)',
      'NDA (National Defence Academy)',
      'CDS (Combined Defence Services)',
      'AFCAT (Air Force Common Admission Test)',
    ],
  },
  {
    category: 'Other / Custom',
    exams: ['Other (Custom Input)'],
  },
]

export const INDIAN_STATES: string[] = [
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
]

export const STUDENT_CATEGORIES: string[] = [
  'Full-Time Competitive Aspirant',
  'College Student / Undergraduate',
  'School Student (Class 9 - 12)',
  'Working Professional & Aspirant',
  'Postgraduate / Researcher',
  'Other',
]
