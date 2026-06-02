import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { TweaksProvider } from './components/tweaks/TweaksContext';
import './index.css';
import './styles/tweaks.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter>
    <TweaksProvider>
      <App />
    </TweaksProvider>
  </HashRouter>,
);
