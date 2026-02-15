export function formatCallEndedReason(reason : string) {
    if (!reason) return "";
  
    return reason
      .split("-") 
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
      .join(" "); 
  }
  