import { atom } from "jotai";

export const channelAtom = atom("");

export const unselectChannelAtom = atom(null, (_, set) => {
  set(channelAtom, "");
});
