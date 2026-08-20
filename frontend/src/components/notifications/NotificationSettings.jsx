function NotificationSettings() {

  return (

    <div className="rounded-2xl bg-white p-6 shadow-card">

      <h2 className="mb-6 text-2xl font-bold text-heading">

        Notification Preferences

      </h2>

      <div className="space-y-5">

        {[
          "Email Notifications",
          "Push Notifications",
          "Inventory Alerts",
          "AI Analysis Alerts",
          "Report Notifications",
        ].map((setting) => (

          <label
            key={setting}
            className="flex items-center justify-between rounded-xl border p-4"
          >

            <span className="font-medium">

              {setting}

            </span>

            <input
              type="checkbox"
              defaultChecked
            />

          </label>

        ))}

      </div>

    </div>

  );

}

export default NotificationSettings;