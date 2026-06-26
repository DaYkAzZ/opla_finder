export default function Loading() {
  return (
    <div className="page">
      <div className="page-header">
        <div
          className="skeleton-block"
          style={{ width: "80px", height: "26px", marginBottom: "8px" }}
        />
        <div
          className="skeleton-block"
          style={{ width: "180px", height: "14px" }}
        />
      </div>

      <div
        className="skeleton-block"
        style={{ height: "200px", borderRadius: "28px", marginBottom: "24px" }}
      />

      <div
        className="skeleton-block"
        style={{ height: "280px", borderRadius: "28px" }}
      />
    </div>
  );
}
