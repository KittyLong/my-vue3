import pkg from "./package.json" assert { type: 'json' };
import typescript from "@rollup/plugin-typescript";
export default {
    input: './src/index.ts',
    output: [
        //1.cjs->nodejs的commonjs规范
        //2.esm标准化规范 
        {
            format:'cjs',
            file:pkg.main
        },
        {
            format:'es',
            file:pkg.module
        },

    ],
    plugins:[
          typescript()
    ]

}