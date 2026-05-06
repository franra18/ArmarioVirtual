const months_long = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const months_short = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

export function format_date_long(date_string) {
  const parsed_date = new Date(String(date_string ?? ''));
  if (Number.isNaN(parsed_date.getTime())) {
    return 'Sin dato';
  }

  const day = parsed_date.getDate();
  const month = months_long[parsed_date.getMonth()];
  const year = parsed_date.getFullYear();

  return `${day} de ${month}, ${year}`;
}

export function format_date_short(date_string) {
  const parsed_date = new Date(String(date_string ?? ''));
  if (Number.isNaN(parsed_date.getTime())) {
    return 'Sin dato';
  }

  const day = parsed_date.getDate();
  const month = months_short[parsed_date.getMonth()];
  const year = parsed_date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function relative_time_since(date_string) {
  const parsed = new Date(String(date_string ?? ''));
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const now = new Date();
  const diff_ms = now - parsed;
  const seconds = Math.floor(diff_ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days < 1) {
    if (hours < 1) {
      if (minutes < 1) return 'Hace unos segundos';
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  }

  if (days < 30) {
    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  const years = Math.floor(months / 12);
  return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
}
