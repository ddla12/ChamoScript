import { OperationsMethods } from "./@types.ts";

export const NumberOperations: OperationsMethods = {
    addition        : (a: number, b: number): number => a + b,
    substraction    : (a: number, b: number): number => a - b,
    division        : (a: number, b: number): number => a / b,
    multiplication  : (a: number, b: number): number => a * b,
    mod             : (a: number, b: number): number => a % b,
    pow             : (a: number, b: number): number => a ** b,
};