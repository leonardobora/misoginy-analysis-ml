import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { appInitializer } from './services/AppInitializer'
import { localDataService } from './services/LocalDataService'

// Inicializar sistema local na inicialização da aplicação
Promise.all([
  appInitializer.initialize(),
  localDataService.initialize()
]).then(([appStatus, _]) => {
  console.log('🎉 Sistema inicializado:', appStatus);
}).catch((error) => {
  console.error('❌ Erro na inicialização:', error);
});

createRoot(document.getElementById("root")!).render(<App />);
