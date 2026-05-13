import { Button } from "../components/Button.tsx";
import { LCD } from "../components/LCD.tsx";
import html2canvas from "html2canvas";
import FileSaver from "file-saver";
import { useSignal } from "@preact/signals";

interface SavableLCDProps {
  id: string;
  rows: number;
  cols: number;
}

export function SavableLCD(props: SavableLCDProps) {
  let text = [];
  let inputs = [];

  for (let i = 0; i < props.rows; i++) {
    const sig = useSignal("");
    text.push(sig);
    inputs.push(
      <input
        class="border m-1"
        maxlength={props.cols}
        onKeyUp={(e) => {
          sig.value = e.currentTarget.value;
        }}
      />,
    );
    inputs.push(<br />);
    sig.subscribe((s) => console.log(`Signal changed to: ${s}`));
  }

  return (
    <div>
      <div class="grid justify-center">{inputs}</div>
      <LCD id={props.id} rows={props.rows} cols={props.cols} text={text} />

      <div class="grid justify-center">
        <input id={`${props.id}-filename`} class="border" value="lcd.png" />
        <Button
          onClick={async () => {
            const c = await html2canvas(
              document.getElementById(props.id)!,
            );
            c.toBlob((b: Blob) =>
              FileSaver.saveAs(
                b,
                (document.getElementById(
                  `${props.id}-filename`,
                )! as HTMLInputElement).value,
              )
            );
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
