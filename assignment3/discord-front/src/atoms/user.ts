import { atom } from "jotai";
import { User } from "../types/common";

export const userAtom = atom<User>({
  nickname: "",
  uuid: "",
});
