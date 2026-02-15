
export function formatDateToYMD(date: Date | string): string {
    console.log('date', date);
    console.log("Received date in formatDateToYMD:", date, typeof date);
    if (typeof date === "string") {
        date = new Date(date); 
    }
    const year = date.getUTCFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');

    return `${month}-${day}-${year}`;
}
