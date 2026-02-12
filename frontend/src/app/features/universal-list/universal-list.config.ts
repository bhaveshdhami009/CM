export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'date' | 'bool' | 'party_search' | 'number';
}


export const ENTITY_CONFIGS: any = {
  cases: {
    label: 'Cases Registry',
    columns: [
      { key: 'file_no', label: 'File No', searchKey: 'file_no' },
      { key: 'filing_no', label: 'Filing No', searchKey: 'filing_no' },
      { key: 'computed_title', label: 'Title', type: 'title', searchKey: 'case_title' },
      { key: 'court_name', label: 'Court', searchKey: 'court_name', path: 'court.name' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    // Fields available for "Advanced Filter" dropdown
    fields: [
      { key: 'file_no', label: 'File No', type: 'text' },
      { key: 'filing_no', label: 'Filing No', type: 'text' },
      { key: 'case_title', label: 'Case Title / Party', type: 'party_search' }, // <--- Special Type
      { key: 'court_name', label: 'Court', type: 'text' },
      { key: 'created_at', label: 'Created Date', type: 'date' }
    ]
  },
  hearings: {
    label: 'Hearing History',
    columns: [
      { key: 'hearing_date', label: 'Date', type: 'date' },
      { key: 'computed_title', label: 'Case Title', type: 'title', searchKey: 'case_title' },
      { key: 'purpose', label: 'Purpose', searchKey: 'purpose' },
      { key: 'court_room', label: 'Room', searchKey: 'court_room' },
      { key: 'outcome', label: 'Outcome', searchKey: 'outcome' }
    ],
    fields: [
      { key: 'hearing_date', label: 'Hearing Date', type: 'date' },
      { key: 'case_title', label: 'Case Title', type: 'party_search' },
      { key: 'purpose', label: 'Purpose', type: 'text' },
      { key: 'outcome', label: 'Outcome', type: 'text' }
    ]
  },
  logs: {
    label: 'Task Logs',
    columns: [
      { key: 'log_date', label: 'Date', type: 'date' },
      { key: 'purpose', label: 'Purpose', searchKey: 'purpose' },
      { key: 'computed_title', label: 'Case Title', type: 'title', searchKey: 'case_title' },
      { key: 'is_pending', label: 'Pending', type: 'bool' }
    ],
    fields: [
      { key: 'log_date', label: 'Log Date', type: 'date' },
      { key: 'case_title', label: 'Case Title', type: 'party_search' },
      { key: 'purpose', label: 'Purpose', type: 'text' },
      { key: 'is_pending', label: 'Pending Status', type: 'bool' } // <--- Bool Type
    ]
  },
  dlsa: {
    label: 'DLSA Records',
    columns: [
      { key: 'registration_no', label: 'Reg No', searchKey: 'registration_no' },
      { key: 'computed_title', label: 'Case Title', type: 'title', searchKey: 'case_title' },
      { key: 'billed_on', label: 'Billed', type: 'date'  },
      { key: 'received_on', label: 'Received', type: 'date' }
    ],
    fields: [
      { key: 'registration_no', label: 'Reg No', type: 'text' },
      { key: 'case_title', label: 'Case Title', type: 'party_search' },
      { key: 'billed_on', label: 'Billed Date', type: 'date' },
      { key: 'received_on', label: 'Received Date', type: 'date' }
    ]
  },
  executions: {
    label: 'Execution',
    columns: [
      { key: 'amount', label: 'Amount', searchKey: 'amount' },
      { key: 'computed_title', label: 'Case Title', type: 'title', searchKey: 'case_title' },
      { key: 'next_due_date', label: 'Next Due', type: 'date' },
      { key: 'is_active', label: 'Active', type: 'bool' }
    ],
    fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'case_title', label: 'Case Title', type: 'party_search' },
      { key: 'next_due_date', label: 'Next Due', type: 'date' },
      { key: 'is_active', label: 'Active Status', type: 'bool' }
    ]
  }
};