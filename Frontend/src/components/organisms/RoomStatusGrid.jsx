import React from 'react';

/**
 * RoomStatusGrid organism — colored room cells grid (manager dashboard)
 * @param {Array<{number, status}>} rooms - status: 'available'|'occupied'|'reserved'|'cleaning'|'maintenance'
 */
const statusColors = {
  available:   'bg-green-400  text-white',
  occupied:    'bg-orange-400 text-white',
  reserved:    'bg-blue-400   text-white',
  cleaning:    'bg-purple-400 text-white',
  maintenance: 'bg-red-400    text-white',
};

const statusLabels = {
  available:   'Available',
  occupied:    'Occupied',
  reserved:    'Reserved',
  cleaning:    'Cleaning',
  maintenance: 'Maintenance',
};

const legend = [
  { status: 'available',   color: 'bg-green-400'  },
  { status: 'reserved',    color: 'bg-blue-400'   },
  { status: 'occupied',    color: 'bg-orange-400' },
  { status: 'cleaning',    color: 'bg-purple-400' },
  { status: 'maintenance', color: 'bg-red-400'    },
];

const RoomStatusGrid = ({ rooms = [], className = '' }) => {
  return (
    <div className={['card p-4', className].join(' ')}>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {legend.map((l) => (
          <div key={l.status} className="flex items-center gap-1.5">
            <div className={['w-3 h-3 rounded-sm', l.color].join(' ')} />
            <span className="text-[11px] text-gray-500 capitalize">{statusLabels[l.status]}</span>
          </div>
        ))}
      </div>
      {/* Grid */}
      <div className="grid grid-cols-10 gap-1">
        {rooms.map((room) => (
          <div
            key={room.number}
            title={`Room ${room.number} — ${statusLabels[room.status] || room.status}`}
            className={[
              'aspect-square rounded-md flex items-center justify-center text-[10px] font-bold cursor-pointer',
              'hover:opacity-80 hover:scale-105 transition-all duration-100',
              statusColors[room.status] || 'bg-gray-200 text-gray-500',
            ].join(' ')}
          >
            {room.number}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomStatusGrid;
