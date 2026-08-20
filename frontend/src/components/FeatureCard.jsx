function FeatureCard({ icon, title, description }) {
  return (
    <div
      style={{
        width: "260px",
        padding: "25px",
        borderRadius: "15px",
        backgroundColor: "#ffffff",
        textAlign: "center",
        boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        transition: "0.3s",
      }}
    >
      <div
        style={{
          fontSize: "50px",
          marginBottom: "15px",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          color: "#1f2937",
          marginBottom: "10px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          color: "#6b7280",
          lineHeight: "1.6",
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default FeatureCard;