import { formatDateToYMD } from "./formatDateToYMD";

export function filterAndPaginate<T extends { [key: string]: unknown }>(
    items: T[],
    search = "",
    currentPage = 1,
    itemsPerPage = 10,
    pageNumbersCount = 7,
    fromDate?: Date,  
    toDate?: Date,
    salesforceId?: string
) {

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const fromDateStr = fromDate ? formatDateToYMD(fromDate) : undefined;
    const toDateStr = toDate ? formatDateToYMD(toDate) : undefined;

    let filteredItems = items;

    if (salesforceId) {
        filteredItems = filteredItems.filter(item => item["salesforce_id"] === salesforceId);
    }


    if (search || fromDate || toDate) {
        filteredItems = filteredItems.filter(item => {
            const matchesSearch = Object.keys(item).some(key => {
                const value = item[key];
                if (['string', 'number'].includes(typeof value)) {
                    return value?.toString().toLowerCase().includes(search.trim().toLowerCase());
                }
                return false;
            });

            const matchesDateRange = Object.keys(item).some(key => {
                const value = item[key];
                if (key === 'add_date' && typeof value === 'string') {
                    const itemDate = new Date(value + "Z"); 
                    const fromDateUTC = fromDateStr ? new Date(fromDateStr + "Z") : undefined;
                    const toDateUTC = toDateStr ? new Date(toDateStr + "Z") : undefined;

                    const isBeforeFromDate = fromDateUTC ? itemDate < fromDateUTC : false;
                    const isAfterToDate = toDateUTC ? itemDate > toDateUTC : false;

                    return !(isBeforeFromDate || isAfterToDate);
                }
                return true;
            });

            return matchesSearch && matchesDateRange;  
        });
    }

    const pagesCount = Math.ceil(filteredItems.length / itemsPerPage);
    filteredItems = filteredItems.slice(start, end);

    const pageNumbers: number[] = [];
    if (currentPage > 0) {
        let toUnshift = currentPage;

        let i = 3;
        do {
            pageNumbers.unshift(toUnshift);
        } while (--i > 0 && --toUnshift > 0);
    }

    while (pageNumbers.length < pageNumbersCount) {
        const toPush = pageNumbers[pageNumbers.length - 1] + 1;
        const toUnshift = pageNumbers[0] - 1;
        if (toPush <= pagesCount)
            pageNumbers.push(toPush);
        else if (toUnshift > 0)
            pageNumbers.unshift(toUnshift);
        else
            break;
    }
    // console.log('filteredItems',filteredItems);
    
    return {
        filteredItems,
        pagesCount,
        pageNumbers
    };
}

export function filterAndPaginateAssis<T extends { [key: string]: unknown }>(
    items: T[],
    search = "",
    currentPage = 1,
    itemsPerPage = 10,
    pageNumbersCount = 7,
    fromDate?: Date,  
    toDate?: Date,
    salesforceId?: string
) {
    // console.log("serach", search);
    // console.log("items", items);
    
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const fromDateStr = fromDate ? formatDateToYMD(fromDate) : undefined;
    const toDateStr = toDate ? formatDateToYMD(toDate) : undefined;

    let filteredItems = Array.isArray(items) ? items : [];

    if (salesforceId) {
        filteredItems = filteredItems.filter(item => item["salesforce_id"] === salesforceId);
    }

 
    if (search || fromDate || toDate) {
        filteredItems = filteredItems.filter(item => {
            const matchesSearch = Object.keys(item).some(key => {
                const value = item[key];
                if (['string', 'number'].includes(typeof value)) {
                    return value?.toString().toLowerCase().includes(search.trim().toLowerCase());
                }
                return false;
            });

            const matchesDateRange = Object.keys(item).some(key => {
                const value = item[key];
                if (key === 'add_date' && typeof value === 'string') {
                    const itemDate = new Date(value + "Z"); 
                    const fromDateUTC = fromDateStr ? new Date(fromDateStr + "Z") : undefined;
                    const toDateUTC = toDateStr ? new Date(toDateStr + "Z") : undefined;

                    const isBeforeFromDate = fromDateUTC ? itemDate < fromDateUTC : false;
                    const isAfterToDate = toDateUTC ? itemDate > toDateUTC : false;

                    return !(isBeforeFromDate || isAfterToDate);
                }
                return true;
            });

            return matchesSearch && matchesDateRange;  
        });
    }

    const pagesCount = Math.ceil((filteredItems?.length || 0) / itemsPerPage);

    filteredItems = Array.isArray(filteredItems)
    ? filteredItems.slice(start, end)
    : [];


    const pageNumbers: number[] = [];
    if (currentPage > 0) {
        let toUnshift = currentPage;

        let i = 3;
        do {
            pageNumbers.unshift(toUnshift);
        } while (--i > 0 && --toUnshift > 0);
    }

    while (pageNumbers.length < pageNumbersCount) {
        const toPush = pageNumbers[pageNumbers.length - 1] + 1;
        const toUnshift = pageNumbers[0] - 1;
        if (toPush <= pagesCount)
            pageNumbers.push(toPush);
        else if (toUnshift > 0)
            pageNumbers.unshift(toUnshift);
        else
            break;
    }
    // console.log('filteredItems',filteredItems);
    
    return {
        filteredItems,
        pagesCount,
        pageNumbers
    };
}