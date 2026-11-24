/** Étiquette colorée. tone : green | amber | rose | blue | gray | dark */
export default function Badge({ tone = 'gray', children }) {
    return <span className={`badge badge-${tone}`}>{children}</span>;
  }