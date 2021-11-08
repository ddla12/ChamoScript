export type ParseType = 
    "VariableDeclaration" | "NumberLiteral" |
    "StringLiteral" | "BooleanLiteral" |
    "EndingToken" | "Identifier" |
    "FunctionDeclaration" | "FunctionCall" |
    "Argument" | "Block" | "Invalid" |
    "Equality" | "ConstantDeclaration" | "VariableUpdating" |
    "ArrayLiteral" | "ArithmeticOperation";

export type TokenType = 
    "MultiLineComment" | "IdentifierName" |
    "LineTerminator" | "StringLiteral" |
    "NumericLiteral" | "SingleLineComment" |
    "Punctuator" | "Whitespace" | "Invalid" |
    "StringValue";

export type Equality = 
    "es igual a" | "se le suma" | "se le divide" |
    "se le resta" | "se le multiplica" | "se eleva a";

export type VariableType = "Constant" | "Variable";

export type Type = "String" | "Array" | "Object" | "Boolean" | "Number";

export type ParsedData<T, U extends Type> = [T, U, ParseType];

export type Arithmetic = string|number;

export interface Token {
    type        : TokenType;
    value       : string;
    inString?   : boolean;
    closed?     : boolean;
}

export interface Parsed {
    type: "Program";
    body: any[]
}

export interface Parse { 
    type    : ParseType;
    value   : any;
} 

export interface ParsedToken {
    type    : ParseType;
    value   : string;
    body    : {};
}

export interface VariableExpressionBody {
    type        : VariableType;
    identifier  : string;
    value       : any;
    equality    : Equality;
}

export type ParserObject = Record<string, ((value: string) => any)>;

export interface OperationsMethods {
    [x: string]: (a: number, b: number) => number;
}