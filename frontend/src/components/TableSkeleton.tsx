const TableSkeleton = ({ rows = 5, columns = 6 }) => {
    return (
        <div className="animate-pulse">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="text-left py-3 px-4">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <td key={colIndex} className="py-3 px-4">
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TableSkeleton;
