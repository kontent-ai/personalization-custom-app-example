import { PersonalizationPanel } from "./components/PersonalizationPanel/PersonalizationPanel.tsx";
import { useAppContext } from "./contexts/AppContext.tsx";

const App = () => {
  const context = useAppContext();

  return (
    <PersonalizationPanel
      environmentId={context.environmentId}
      itemId={context.contentItemId}
      languageId={context.languageId}
    />
  );
};

export default App;
