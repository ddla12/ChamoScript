export type ParseType = 
    | "VariableDeclaration" 
    | "NumberLiteral" 
    | "StringLiteral" 
    | "BooleanLiteral" 
    | "ObjectDeclaration"
    | "EndingToken" 
    | "Identifier" 
    | "FunctionDeclaration" 
    | "FunctionCall" 
    | "Argument" 
    | "Block" 
    | "Invalid" 
    | "Equality" 
    | "ConstantDeclaration" 
    | "VariableUpdating" 
    | "ArrayLiteral" 
    | "ArithmeticOperation" 
    | "StringsConcatenation" 
    | "MultipleVariableDeclaration";

export type TokenType = 
    | "MultiLineComment" 
    | "IdentifierName" 
    | "LineTerminator" 
    | "StringLiteral" 
    | "NumericLiteral" 
    | "SingleLineComment" 
    | "Punctuator" 
    | "Whitespace" 
    | "Invalid" 
    | "StringValue";

export type Equality = 
    | "es igual a" 
    | "se le suma" 
    | "se le divide" 
    | "se le resta" 
    | "se le multiplica" 
    | "se eleva a";

export type VariableType = "Constant" | "Variable";

export type Type = "String" | "Array" | "Object" | "Boolean" | "Number";

export type ParsedData<T, U extends Type> = [T, U, ParseType];

export type Arithmetic = string|number;

export type Props = Record<string, Type>;

export interface Variables {
    readonly varType    : VariableType, 
    readonly type       : Type,
    readonly identifier : string;
};

export interface Objetos {
    readonly identifier : string;
    readonly props      : Props;
}

export interface Token {
    type        : TokenType;
    value       : string;
    inString?   : boolean;
    closed?     : boolean;
}

export interface Parsed {
    type: "Program";
    body: any[];
    Variables: Variables[];
}

export interface Parse { 
    type    : ParseType;
    value   : any;
}

export interface ParsedToken {
    type    : ParseType;
    value   : string;
    body    : ExpressionBody;
}

export interface MultipleVariableExpression extends ExpressionBody {
    variables: VariableExpressionBody[],
    type: Type
}

export interface ExpressionBody {
    readonly identifier?: string;
}

export interface VariableExpressionBody extends ExpressionBody {
    readonly varType    : VariableType;
    readonly value      : any;
    readonly equality   : Equality;
    readonly type       : Type;
}

export interface ObjectExpressionBody extends ExpressionBody {
    readonly props  : Props;
    readonly literal: Object; 
}

export type ParserObject = Record<string, ((value: string) => any)>;

export interface OperationsMethods {
    [x: string]: (a: number, b: number) => number;
}

export interface ErrorObject {
    [x: string]: Record<string, ((...values: any[]) => string)>;
}