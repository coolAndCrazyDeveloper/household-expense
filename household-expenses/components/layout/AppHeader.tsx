import { ReceiptText } from 'lucide-react';
import { APP_NAME } from '../../common/constants/app';
export function AppHeader() {
  return <header className="app-header"><span className="brand-icon"><ReceiptText size={19}/></span><span className="brand-copy"><b>{APP_NAME}</b><small>Shared living, simplified</small></span><span className="sync-status"><i/> LIVE SYNC</span></header>;
}
