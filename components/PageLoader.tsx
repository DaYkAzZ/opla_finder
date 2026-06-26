interface Props {
  message?: string;
}

export default function PageLoader({ message = "Chargement" }: Props) {
  return (
    <div className="loader">
      <div className="loader__spinner" />
      <p className="loader__text">{message}</p>
    </div>
  );
}
