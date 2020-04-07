import {WinStatus} from "./win-status";

export interface GameDto {
    fields: number[][];
    status: WinStatus;
}