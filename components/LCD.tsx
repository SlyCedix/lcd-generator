//import { useEffect } from "preact/hooks"

import { assert } from "$std/assert/assert.ts";
import { computed, Signal, useComputed } from "@preact/signals";
import { char_map } from "../util/char_map.ts";
import { BitSet } from "npm:bitset";

export const CHAR_HEIGHT = 8;
export const CHAR_WIDTH = 5;

interface LCDProps {
  id: string;
  cols: number;
  rows: number;
  text: Signal<string>[];
}

function Pixel(on_off: Signal<BitSet>, offset: number) {
  return useComputed(() => {
    const color = on_off.value.get(offset) ? "bg-blue-900" : "bg-blue-400";
    return (
      <div
        class={`pixel table-cell w-[4px] h-[4px] pointer-events-none ${color}`}
      />
    );
  });
}

function CharRow(map: Signal<BitSet>, offset: number) {
  const out = [];
  for (let i = 0; i < CHAR_WIDTH; i++) {
    out.push(Pixel(map, offset + i));
  }

  return (
    <div class="char_line table-row">
      {out}
    </div>
  );
}

function Char(char: Signal<string>) {
  const map_sig = useComputed(() => {
    assert(char.value.length == 1);
    if (char.value in char_map) return char_map[char.value];
    else return char_map[" "];
  });

  const out = [];

  for (let i = 0; i < CHAR_HEIGHT; i++) {
    out.push(CharRow(map_sig, i * CHAR_WIDTH));
  }

  return (
    <div class="char table table-cell border-spacing-[1px]">
      {out}
    </div>
  );
}

function LCDLine(props: LCDProps, line: Signal<string>) {
  const out = [];

  for (let i = 0; i < props.cols; i++) {
    const sig = computed(() => {
      return i < line.value.length ? line.value[i] : " ";
    });
    out.push(Char(sig));
  }

  return <div class="lcd-line table-row pointer-events-none">{out}</div>;
}

export function LCD(props: LCDProps) {
  const out = [];
  for (let i = 0; i < props.rows; i++) {
    const sig = computed(() => {
      return props.text[i].value;
    });
    out.push(LCDLine(props, sig));
  }

  return (
    <div
      id={props.id}
      class="lcd table bg-blue-300 border-8 rounded-lg border-gray-800 p-1 border-spacing-y-[3px] border-spacing-x-[1px] pointer-events-none"
    >
      {out}
    </div>
  );
}
