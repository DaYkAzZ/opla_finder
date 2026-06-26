interface Props {
  title?: string;
  subtitle?: string;
}

export default function PageHeader({
  title = "Salut",
  subtitle = "Trouvons ton prochain resto",
}: Props) {
  return (
    <header className="page-header">
      <h1 className="page-header__title">{title}</h1>
      <p className="page-header__subtitle">{subtitle}</p>
    </header>
  );
}
