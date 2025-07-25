import { memo } from 'react'

const Visual = memo(({ heading, Component }) => {
  return (
    <div className="group bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      
      <div className="mb-6">
        {typeof heading === 'string' ? (
          <h2 className="text-lg font-semibold text-gray-900">
            {heading}
          </h2>
        ) : (
          heading
        )}
      </div>

      <div className="relative min-h-[300px] flex items-center justify-center">
        {Component ? (
          <div className="w-full h-full">
            <Component />
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded animate-pulse"></div>
            </div>
            <p className="text-gray-500 text-sm">
              Loading content...
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

export default Visual;