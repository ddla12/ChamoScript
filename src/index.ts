#!usr/
import Transpiler from "./Transpiler.ts";

Transpiler(`
var myVar es igual a <12 + 156 / 12 - (41 / 24 * (2 * 2))>;
`);