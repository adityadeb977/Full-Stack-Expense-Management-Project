import React from "react";

const Pagination = ({ page, pageSize, total, onPageChange }) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (total === 0) {
        return null;
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 4;
        let startPage = Math.max(1, page - 1);
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-1">
            <p className="text-sm text-gray-600">
                Showing {start}-{end} of {total}
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    &lt; Previous
                </button>

                {getPageNumbers().map((pageNum) => (
                    <button
                        key={pageNum}
                        type="button"
                        onClick={() => onPageChange(pageNum)}
                        className={`px-3 py-1.5 text-sm rounded-lg border ${
                            pageNum === page
                                ? "bg-[#193680] text-white border-[#193680]"
                                : "border-gray-300 hover:bg-gray-100"
                        }`}
                    >
                        {pageNum}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Next &gt;
                </button>
            </div>
        </div>
    );
};

export default Pagination;
