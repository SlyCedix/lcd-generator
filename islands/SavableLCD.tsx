import { Button } from "../components/Button.tsx";
import { LCD } from "../components/LCD.tsx";
import html2canvas from "html2canvas";
import FileSaver from "file-saver";
import { Signal, useSignal } from "@preact/signals";

interface SavableLCDProps {
  id: string;
  rows: number;
  cols: number;
}

export function SavableLCD(props: SavableLCDProps) {
  const inputs = [];

  const sig: Signal<string[]> = useSignal([]);
  let other: string[] = [];

  for (let i = 0; i < props.rows; i++) {
    sig.value.push("");
    other.push("");
    inputs.push(
      <input
        class="border m-1"
        maxlength={props.cols}
        onKeyUp={(e) => {
          other[i] = e.currentTarget.value;
          const o = sig.value;
          sig.value = other;
          other = o;
        }}
      />,
    );
    inputs.push(<br />);
  }

  return (
    <div class="savable-lcd-container">
      <div class="grid justify-center">{inputs}</div>
      <LCD id={props.id} rows={props.rows} cols={props.cols} text={sig} />

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
