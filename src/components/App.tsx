import { OTTModal } from "./OTTModal";

function App({ root }: { root: HTMLElement }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] font-geist">
      <OTTModal root={root} />
    </div>
  );
}

export default App;
