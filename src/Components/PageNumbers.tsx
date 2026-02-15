import { TbChevronLeft, TbChevronRight, TbChevronsLeft, TbChevronsRight, TbSignRight } from "react-icons/tb";

export interface PageNumbersProps {
    currentPage: number,
    setCurrentPage: Function,
    pageNumbers: number[],
    pagesCount: number,
    className?: string
}

export function PageNumbers({ currentPage, setCurrentPage, pageNumbers, pagesCount, className = "" }: PageNumbersProps) {
    // Show ellipsis for large page ranges
    const getDisplayPages = () => {
        if (pagesCount <= 7) return pageNumbers;
        
        const result: (number | string)[] = [];
        
        if (currentPage <= 4) {
            // Show first 5 pages, then ellipsis, then last page
            for (let i = 1; i <= 5; i++) result.push(i);
            result.push('...');
            result.push(pagesCount);
        } else if (currentPage >= pagesCount - 3) {
            // Show first page, ellipsis, then last 5 pages
            result.push(1);
            result.push('...');
            for (let i = pagesCount - 4; i <= pagesCount; i++) result.push(i);
        } else {
            // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
            result.push(1);
            result.push('...');
            result.push(currentPage - 1);
            result.push(currentPage);
            result.push(currentPage + 1);
            result.push('...');
            result.push(pagesCount);
        }
        
        return result;
    };

    const displayPages = getDisplayPages();

    return (
        <div className={`flex items-center justify-center gap-1 pt-4 ${className}`}>
            {/* First Page */}
            <button
                className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent`}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
            >
                <TbChevronsLeft className="w-4 h-4 text-gray-600" />
            </button>

            {/* Previous Page */}
            <button
                className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent`}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <TbChevronLeft className="w-4 h-4 text-gray-600" />
            </button>

            {/* Page Numbers */}
            {displayPages.map((page, index) => {
                if (page === '...') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="flex items-center justify-center w-9 h-9 text-gray-400"
                        >
                            <TbSignRight className="w-4 h-4" />
                        </span>
                    );
                }

                return (
                    <button
                        key={index}
                        className={`flex items-center justify-center min-w-9 h-9 rounded-lg border transition-all duration-200 ${
                            page === currentPage
                                ? "bg-primary border-primary text-white shadow-sm"
                                : "border-gray-300 text-gray-700 hover:border-primary hover:bg-primary/5"
                        }`}
                        onClick={() => setCurrentPage(page as number)}
                    >
                        <span className="text-sm font-medium">{page}</span>
                    </button>
                );
            })}

            {/* Next Page */}
            <button
                className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent`}
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagesCount}
            >
                <TbChevronRight className="w-4 h-4 text-gray-600" />
            </button>

            {/* Last Page */}
            <button
                className={`flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent`}
                onClick={() => setCurrentPage(pagesCount)}
                disabled={currentPage === pagesCount}
            >
                <TbChevronsRight className="w-4 h-4 text-gray-600" />
            </button>
        </div>
    );
}