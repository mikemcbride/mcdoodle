import clsx from 'clsx';

export default function RankedResult({ row }) {
  return (
    <div
      key={row.date}
      className="p-4 md:py-6 lg:py-8 lg:px-6 flex items-center"
    >
      <div className="font-bold text-sm md:text-base flex-shrink-0 text-right pr-4 md:pr-6 lg:pr-8">
        {row.date}
      </div>
      <div className="flex h-3 md:h-6 flex-shrink rounded w-full">
        {row.yes > 0 && (
          <div
            className={clsx("group relative bg-emerald-500", row.yes > 0 ? 'rounded-l' : '', row.yes === row.total ? 'rounded-r' : '')}
            style={{ width: `${(row.yes / row.total) * 100}%` }}
          >
            <span className="hidden group-hover:block px-2 py-1 rounded text-xs bg-gray-700 bg-opacity-90 text-white font-medium absolute -top-8 left-1/2 transform -translate-x-1/2">{row.yes}</span>
          </div>
        )}

        {row.if_needed > 0 && (
          <div
            className={clsx("group relative bg-yellow-400", row.yes === 0 ? 'rounded-l' : '', row.no === 0 ? 'rounded-r' : '')}
            style={{ width: `${(row.if_needed / row.total) * 100}%` }}
          >
            <span className="hidden group-hover:block px-2 py-1 rounded text-xs bg-gray-700 bg-opacity-90 text-white font-medium absolute -top-8 left-1/2 transform -translate-x-1/2">{row.if_needed}</span>
          </div>

        )}

        {row.no > 0 && (
          <div
            className={clsx("group relative bg-red-500", row.no > 0 ? 'rounded-r' : '', row.no === row.total ? 'rounded-l' : '')}
            style={{ width: `${(row.no / row.total) * 100}%` }}
          >
            <span className="hidden group-hover:block px-2 py-1 rounded text-xs bg-gray-700 bg-opacity-90 text-white font-medium absolute -top-8 left-1/2 transform -translate-x-1/2">{row.no}</span>
          </div>
        )}
      </div>
    </div>
  )
}
