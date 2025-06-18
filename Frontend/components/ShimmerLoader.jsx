const ShimmerLoader = ({ count = 5 }) => {
  return (
    <div className=" flex flex-col flex-1 w-full items-center justify-start h-full">
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className=" flex flex-1 justify-between w-full h-12 bg-gray-700 rounded-md p-4 mb-3 animate-pulse "
        >
          <div className="h-4 bg-gray-600 rounded w-6/7 mb-2"></div>
          <div className="h-3 bg-gray-600 rounded w-1/12"></div>
        </div>
      ))}
    </div>
  );
};

export default ShimmerLoader;
