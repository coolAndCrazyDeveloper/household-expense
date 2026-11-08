import type { MemberBreakdown } from '../../common/types';
import { formatMoney } from '../../common/utils/format';
import { Avatar } from '../atoms/Avatar';

export function MemberSummary({ rows }: { rows: MemberBreakdown[] }) {
  return <div className="member-list">{rows.map((row, index) => <article className="member-card" key={row.member.id}>
    <Avatar name={row.member.display_name} index={index}/>
    <div className="member-details"><b>{row.member.display_name}</b><small>Common {formatMoney(row.common)} · Shared {formatMoney(row.shared)} · Individual {formatMoney(row.individual)}</small></div>
    <strong>{formatMoney(row.total)}</strong>
  </article>)}</div>;
}
