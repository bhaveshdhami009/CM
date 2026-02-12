// src/utils/case.utils.ts

export const processCaseData = (c: any) => {
  const now = new Date();
  
  // --- 1. Analyze Hearings ---
  let nextHearingDate: Date | null = null;
  let stage = 'New Case';

  if (c.hearings && c.hearings.length > 0) {
    // Sort: Oldest to Newest
    const sortedHearings = c.hearings.sort((a: any, b: any) => 
      new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime()
    );
    
    // Find first future hearing
    const next = sortedHearings.find((h: any) => new Date(h.hearing_date) > now);
    
    if (next) {
      nextHearingDate = next.hearing_date;
      stage = next.purpose;
    } else {
      const last = sortedHearings[sortedHearings.length - 1];
      stage = last.purpose;
    }
  }

  // --- 2. Analyze Logs ---
  const pendingLogs = c.logs?.filter((l: any) => l.is_pending);
  
  const completedLogs = c.logs?.filter((l: any) => !l.is_pending)
    .sort((a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());

  // --- 3. Determine Display Status ---
  let statusDisplay = stage;
  
  if (pendingLogs && pendingLogs.length > 0) {
    statusDisplay = `Pending: ${pendingLogs[0].purpose}`;
  } 
  else if (nextHearingDate) {
    statusDisplay = `Next: ${new Date(nextHearingDate).toLocaleDateString()}`;
  } 
  else if (completedLogs && completedLogs.length > 0) {
    statusDisplay = `Done: ${completedLogs[0].purpose}`;
  }

  return {
    ...c,
    next_hearing_date: nextHearingDate, 
    stage: stage,
    status: statusDisplay
  };
};