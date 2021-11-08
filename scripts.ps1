param(
    [string]$command = "run"
)

Switch($command) {
    "run" { 
        deno run --config ./tsconfig.json ./src/index.ts
        Break;
    }
}
