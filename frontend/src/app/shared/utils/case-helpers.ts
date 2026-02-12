// src/shared/utils/case-helpers.ts

export function formatCaseTitle(caseData: any): string {
  if (!caseData || !caseData.parties) return 'Unknown Case';

  // DTO Structure from Repo: parties array contains { party: { first_name... }, role: ... }
  const petitioners = caseData.parties
    .filter((p: any) => p.role === 'Petitioner')
    .map((p: any) => p.party); // Extract nested party object

  const respondents = caseData.parties
    .filter((p: any) => p.role === 'Respondent')
    .map((p: any) => p.party);

  // Helper to format a single side
  const formatSide = (list: any[]) => {
    if (!list || list.length === 0) return 'Unknown';
    
    // Access the party object safely
    const firstName = list[0]?.first_name || 'Unknown';
    const lastName = list[0]?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    if (list.length === 2) return `${fullName} & Anr.`;
    if (list.length > 2) return `${fullName} & Ors.`;
    
    return fullName;
  };

  return `${formatSide(petitioners)} vs. ${formatSide(respondents)}`;
}