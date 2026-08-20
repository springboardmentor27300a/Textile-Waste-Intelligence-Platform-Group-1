function NotificationFilter({
  category,
  setCategory,
  unreadOnly,
  setUnreadOnly,
}) {

  const filters = [
    "All",
    "Inventory",
    "Collections",
    "Recycling",
    "AI",
    "Sustainability",
    "Reports",
    "System",
  ];


  return (

    <div className="rounded-2xl bg-white p-5 shadow-card">

      <div className="flex flex-wrap items-center gap-3">

        {filters.map(filter => (

          <button
            key={filter}
            type="button"
            onClick={() => {

              setCategory(filter);

              setUnreadOnly(false);

            }}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              category === filter &&
              !unreadOnly
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >

            {filter}

          </button>

        ))}


        <button
          type="button"
          onClick={() => {

            setUnreadOnly(true);
            setCategory("All");

          }}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            unreadOnly
              ? "bg-red-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >

          Unread

        </button>

      </div>

    </div>

  );

}


export default NotificationFilter;