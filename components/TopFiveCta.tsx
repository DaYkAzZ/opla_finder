import Link from "next/link";

export default function TopFiveCta() {
  return (
    <Link href="/top-5" className="hero-cta">
      <span className="hero-cta__badge badge badge--hero">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M8 3V9M16 3V9M4 11H20M5 7H19C20.1 7 21 7.9 21 9V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V9C3 7.9 3.9 7 5 7Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Ton pick du moment
      </span>

      <h2 className="hero-cta__title">
        Ton prochain repas en 10 secondes
      </h2>
      <p className="hero-cta__desc">
        On a sélectionné les meilleurs spots pour toi.
      </p>

      <span className="hero-cta__btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3L14.5 8.5L20.5 9.3L16.25 13.7L17.2 19.7L12 17L6.8 19.7L7.75 13.7L3.5 9.3L9.5 8.5L12 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        Voir le Top 5
      </span>
    </Link>
  );
}
