"use client";

interface Props {
  status: "waiting" | "denied";
}

export default function LocationGate({ status }: Props) {
  return (
    <div className="center-state">
      {status === "waiting" && <div className="location-gate__dot" />}
      <p className="center-state__text">
        {status === "waiting"
          ? "Localisation en cours"
          : "Localisation refusée"}
      </p>
      {status === "denied" && (
        <p className="center-state__text">
          Active la localisation dans les réglages de ton navigateur.
        </p>
      )}
    </div>
  );
}
