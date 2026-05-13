import { SavableLCD } from "../islands/SavableLCD.tsx";

export default function Home() {
  return (
    <div class="grid justify-center">
      <SavableLCD id="lcd0" rows={4} cols={20} />
    </div>
  );
}
